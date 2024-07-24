// utils/scrape.js
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function scrapeWreckDivingSites() {
    const url = "https://en.wikipedia.org/wiki/List_of_wreck_diving_sites";
    const links = [];

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Select all links within the list of wreck diving sites
        $("li a").each((index, element) => {
            const link = $(element).attr("href");
            if (link && link.startsWith("/wiki/")) {
                links.push(`https://en.wikipedia.org${link}`);
            }
        });

    } catch (error) {
        console.error("Error fetching the page:", error);
    }

    // Print the entire array of URLs
    console.dir(links, { maxArrayLength: null });
    // Print the number of array elements
    console.log(`Number of links: ${links.length}`);

    // Convert the array to a JSON string
    const jsonLinks = JSON.stringify(links);

    // Investigate each link asynchronously
    links.forEach(link => {
        investigateLink(link);
    });

    return jsonLinks;
}

async function investigateLink(link) {
    try {
        const { data } = await axios.get(link);
        
        // Call the analyzeContents function
        analyzeContents();

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        // Extract the link name from the URL
        const linkName = link.split("/").pop();
        const filename = path.join(__dirname, "../bin", `${linkName}_${timestamp}.html`);

        fs.writeFileSync(filename, data);
        console.log(`Saved HTML content of ${link} to ${filename}`);
    } catch (error) {
        console.error(`Error fetching the page ${link}:`, error);
    }
}

// Function stub for analyzeContents
function analyzeContents() {
    // This function currently does nothing
}

module.exports = {
    scrapeWreckDivingSites
};
