import checkProgress from "./checkProgress";
import cronParser from 'cron-parser';
import cron from 'node-cron';
import {authorize} from "./sendEmail";

// Define a type for the environment variable keys to improve type checking
type EnvKey = 'USERNAME' | 'PASSWORD' | 'MY_EMAIL' | 'MY_NAME';

const cronSchedule: string = `${process.env.CRON_SCHEDULE}` || '0 * * * *';

(async () => {
    // Check if an environment variable exists
    checkEnvVariables();
    await checkCredentials();
    try {
        await run();
        console.log('Scheduled task started');
        // Schedule your task to run on the desired schedule, e.g., every hour
        cron.schedule(cronSchedule, async () => {
            console.log('Running scheduled task');
            await run();
        });
    }catch (err){
        console.error('Error starting scheduled task:', err);
    }
})();

async function run(): Promise<void> {
    await checkProgress();
    // Use cron-parser to determine the next execution time
    try {
        const interval = cronParser.parseExpression(cronSchedule);
        console.log('Next task will run at:', interval.next().toString());
    } catch (err) {
        console.error('Error parsing cron schedule:', err);
    }
}

// Function to check if all required environment variables are set
function checkEnvVariables(): void {
    // Required environment variables
    const requiredEnv: EnvKey[] = ['USERNAME', 'PASSWORD', 'MY_EMAIL', 'MY_NAME'];
    const unsetEnv: string[] = requiredEnv.filter((envVar: EnvKey) => !process.env[envVar]);

    if (unsetEnv.length > 0) {
        console.error(`Missing required environment variables: ${unsetEnv.join(', ')}`);
        process.exit(1); // Exit the application with an error code
    } else {
        console.log('All required environment variables are set');
    }
}

async function checkCredentials(){
    let auth = await authorize();
    if(auth){
        console.log('Credentials are valid');
    }else{
        console.log('Credentials are invalid');
        process.exit(1);
    }
    return
}
