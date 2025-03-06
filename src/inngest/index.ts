

import { Inngest } from "inngest";
import { updateInsights } from "./functions";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Create an empty array where we'll export future Inngest functions




const insightUpdate = inngest.createFunction(
    { id: "Update Insights",name:"Insight Update" },
    {cron:"0 0 * * 0 "},
    async () => {
        
        await updateInsights();
    },
);

export const functions = [insightUpdate];