// utils/scrape.js
const axios = require("axios");
const cheerio = require("cheerio");

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

    return jsonLinks;
}

module.exports = {
    scrapeWreckDivingSites
};