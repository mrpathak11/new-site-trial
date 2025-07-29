const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function updateResearchGateStats() {
  try {
    // Fetch the ResearchGate profile page
    const url = 'https://www.researchgate.net/profile/Suman-Pathak';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Extract stats (adjust selectors based on actual page structure)
    const totalReads = $('div[data-testid="publicProfileStatsReads"]').text().replace(/,/g, '') || '0';
    const researchInterestScore = $('div.nova-legacy-e-text--size-xl:contains("Research Interest")').next().text() || '0';
    const recommendations = $('div.nova-legacy-e-text--size-xl:contains("Recommendations")').next().text() || '0';

    // Read the existing HTML file
    const htmlFilePath = 'index.html'; // Adjust path to your HTML file
    let htmlContent = await fs.readFile(htmlFilePath, 'utf8');

    // Update the HTML content with new stats
    htmlContent = htmlContent.replace(
      /<data value="\d+">\.*\d+<\/data>/,
      `<data value="${Math.min(parseInt(totalReads) / 1000, 100)}">............................................${totalReads}</data>`
    );
    htmlContent = htmlContent.replace(
      /<data value="\d+">\.*\d+\.\d+<\/data>/,
      `<data value="${Math.min(parseFloat(researchInterestScore), 100)}">.......................${researchInterestScore}</data>`
    );
    htmlContent = htmlContent.replace(
      /<data value="\d+">\.*\d+<\/data>/,
      `<data value="${Math.min(parseInt(recommendations) * 10, 100)}">.............................${recommendations}</data>`
    );

    // Update progress bars (scale values appropriately)
    htmlContent = htmlContent.replace(
      /<div class="skill-progress-fill" style="width: \d+%;">/,
      `<div class="skill-progress-fill" style="width: ${Math.min(parseInt(totalReads) / 1000, 100)}%;">`
    );
    htmlContent = htmlContent.replace(
      /<div class="skill-progress-fill" style="width: \d+%;">/,
      `<div class="skill-progress-fill" style="width: ${Math.min(parseFloat(researchInterestScore), 100)}%;">`
    );
    htmlContent = htmlContent.replace(
      /<div class="skill-progress-fill" style="width: \d+%;">/,
      `<div class="skill-progress-fill" style="width: ${Math.min(parseInt(recommendations) * 10, 100)}%;">`
    );

    // Write the updated HTML back to the file
    await fs.writeFile(htmlFilePath, htmlContent);
    console.log('Successfully updated ResearchGate stats.');

  } catch (error) {
    console.error('Error updating ResearchGate stats:', error.message);
    process.exit(1);
  }
}

updateResearchGateStats();
