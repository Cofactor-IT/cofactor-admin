/**
 * setup-local-scout-db.mjs
 *
 * Bootstraps a local Scout Postgres database for Admin integration tests.
 * - Pushes Scout Prisma schema using admin credentials
 * - Creates/updates read-only and scoped-write roles
 * - Applies grants for read and status-only write behavior
 */

import 'dotenv/config';
import { Client } from 'pg';
import { spawn } from 'node:child_process';

function requireEnv(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`${name} is required`);
    }
    return value;
}

function escapeSqlLiteral(value) {
    return value.replaceAll("'", "''");
}

function runCommand(command, args, env) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            env,
        });

        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
        });
    });
}

async function main() {
    const isWindows = process.platform === 'win32';

    const scoutDbName = requireEnv('SCOUT_DB_NAME', 'cofactor_scout_db');
    const scoutDbHost = requireEnv('SCOUT_DB_HOST', 'localhost');
    const scoutDbPort = requireEnv('SCOUT_DB_PORT', '55435');
    const scoutDbAdminUser = requireEnv('SCOUT_DB_ADMIN_USER', 'postgres');
    const scoutDbAdminPassword = requireEnv('SCOUT_DB_ADMIN_PASSWORD', 'cofactor_scout_local');
    const scoutReadonlyUser = requireEnv('SCOUT_DB_READONLY_USER', 'cofactor_admin_readonly');
    const scoutReadonlyPassword = requireEnv(
        'SCOUT_DB_READONLY_PASSWORD',
        'cofactor_admin_readonly_local'
    );
    const scoutWriteUser = requireEnv('SCOUT_DB_WRITE_USER', 'cofactor_admin_write');
    const scoutWritePassword = requireEnv('SCOUT_DB_WRITE_PASSWORD', 'cofactor_admin_write_local');

    const computedAdminUrl = `postgresql://${scoutDbAdminUser}:${scoutDbAdminPassword}@${scoutDbHost}:${scoutDbPort}/${scoutDbName}?schema=public`;
    const scoutAdminUrl = process.env.SCOUT_DB_ADMIN_URL ?? computedAdminUrl;
    const scoutReadonlyUrl = `postgresql://${scoutReadonlyUser}:${scoutReadonlyPassword}@${scoutDbHost}:${scoutDbPort}/${scoutDbName}?schema=public`;
    const scoutWriteUrl = `postgresql://${scoutWriteUser}:${scoutWritePassword}@${scoutDbHost}:${scoutDbPort}/${scoutDbName}?schema=public`;

    console.log('Pushing Scout schema to local database...');
    if (isWindows) {
        await runCommand(
            'cmd.exe',
            ['/d', '/s', '/c', 'npx prisma db push --schema=prisma/scout/schema.prisma'],
            {
                ...process.env,
                SCOUT_DB_READONLY_URL: scoutAdminUrl,
            }
        );
    } else {
        await runCommand('npx', ['prisma', 'db', 'push', '--schema=prisma/scout/schema.prisma'], {
            ...process.env,
            SCOUT_DB_READONLY_URL: scoutAdminUrl,
        });
    }

    const client = new Client({ connectionString: scoutAdminUrl });
    await client.connect();

    const escapedReadonlyUser = escapeSqlLiteral(scoutReadonlyUser);
    const escapedReadonlyPassword = escapeSqlLiteral(scoutReadonlyPassword);
    const escapedWriteUser = escapeSqlLiteral(scoutWriteUser);
    const escapedWritePassword = escapeSqlLiteral(scoutWritePassword);

    console.log('Applying local Scout roles and grants...');
    await client.query(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '${escapedReadonlyUser}') THEN
    CREATE ROLE "${escapedReadonlyUser}" LOGIN PASSWORD '${escapedReadonlyPassword}';
  ELSE
    ALTER ROLE "${escapedReadonlyUser}" WITH LOGIN PASSWORD '${escapedReadonlyPassword}';
  END IF;
END
$$;
`);

    await client.query(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '${escapedWriteUser}') THEN
    CREATE ROLE "${escapedWriteUser}" LOGIN PASSWORD '${escapedWritePassword}';
  ELSE
    ALTER ROLE "${escapedWriteUser}" WITH LOGIN PASSWORD '${escapedWritePassword}';
  END IF;
END
$$;
`);

    await client.query(`GRANT CONNECT ON DATABASE "${scoutDbName}" TO "${scoutReadonlyUser}"`);
    await client.query(`GRANT CONNECT ON DATABASE "${scoutDbName}" TO "${scoutWriteUser}"`);
    await client.query(`GRANT USAGE ON SCHEMA public TO "${scoutReadonlyUser}"`);
    await client.query(`GRANT USAGE ON SCHEMA public TO "${scoutWriteUser}"`);
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${scoutReadonlyUser}"`);
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${scoutWriteUser}"`);
    await client.query(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "${scoutReadonlyUser}"`
    );
    await client.query(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "${scoutWriteUser}"`
    );
    await client.query(`REVOKE UPDATE ON "ResearchSubmission" FROM "${scoutWriteUser}"`);
    await client.query(`GRANT UPDATE ("status") ON "ResearchSubmission" TO "${scoutWriteUser}"`);

    await client.end();

    console.log('');
    console.log('Local Scout DB bootstrap complete.');
    console.log('Use these local env values in .env:');
    console.log(`SCOUT_DB_READONLY_URL="${scoutReadonlyUrl}"`);
    console.log(`SCOUT_DB_WRITE_URL="${scoutWriteUrl}"`);
}

main().catch((error) => {
    console.error('Failed to setup local Scout DB:');
    console.error(error);
    process.exit(1);
});
