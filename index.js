const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors());
app.get('/fetch-html', async (req, res) => {
    try {
        // Get the URL and the target words (class content) from the query string
        const url = req.query.url;
        const classWords = req.query.classWords; // Words to search for in the class attribute

        // Make an HTTP request to fetch the HTML content
        const response = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(response.data);

        // Find all divs, and filter the one(s) that contain the class words
        let foundDiv = null;

        $('div').each((index, element) => {
            const classAttribute = $(element).attr('class');
            
            if (classAttribute && classAttribute.includes(classWords)) {
                foundDiv = $.html(element);  // Get the full HTML of the div element
                return false;  // Exit the loop once the div is found
            }
        });

        if (!foundDiv) {
            return res.status(404).json({ message: `No div found with class containing: ${classWords}` });
        }

        // Return the found div as HTML
        res.json({
            foundDiv: foundDiv,
            message: `Successfully fetched div containing class words: ${classWords}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching HTML content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});