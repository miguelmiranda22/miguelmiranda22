const Page = require("../models/page");
const website_controller = require("../controllers/websiteController");
const evaluation_controller = require("../controllers/evaluationController");

const asyncHandler = require("express-async-handler");


// Display detail page for a specific Page.
exports.page_details = asyncHandler(async (req, res, next) => {

  let receivedUrl = decodeURIComponent(req.params.url);
  // Get details of website
  const [page] = await Promise.all([
    Page.findOne({ url: receivedUrl }).populate('evaluation').exec(),
  ]);
  if (page === null) {
    // No results.
    const err = new Error("Page not found");
    err.status = 404;
    return next(err);
  }

  res.json(page);
});


// Display list of all Pages of a Website.
exports.page_list = asyncHandler(async (req, res, next) => {

  let url_website = decodeURIComponent(req.params.url);
  
  //Get details of website
  const website = await website_controller.get_website(url_website);
  if (!website) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }
  
  //Get the pages associated to the website
  const pages = website.pages;
  if (!pages || pages.length === 0) {
    // No results.
    return res.json("Website has no pages");
  }

  // Populate each page with the evaluation
  await Page.populate(pages, { path: "evaluation" });

  res.json(pages);
});


// Handle page create on POST.
exports.page_create_post = asyncHandler(async (req, res, next) => {
  
  let url_website = decodeURIComponent(req.params.url);
  
  //Get details of website
  const website = await website_controller.get_website(url_website);
  if (!website) {
    // No results.
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  let url_page = decodeURIComponent(req.body.url);
  
  // Regular expression to match URL format and belonging to the website, but not the website URL itself
  const urlRegex = new RegExp(`^(?!${url_website}$)${url_website}(\/[^\/]+)*$`);


  // Check if the URL format is correct
  if (!urlRegex.test(url_page)) {
    return res.status(400).json({ error: 'Invalid URL format ' + url_website + ' ' + url_page });
  }

  // Data from form is valid. Create a Page object
  let page = new Page({
    url: url_page,
  });
  // Save page.
  await page.save();

  // Add the page to the list of pages of the website.
  website.pages.push(page);
  await website.save();

  // Atualiza o estado do website
  await website_controller.update_estado(url_website);
  await website.save();
  
  res.json(page);
});


// Deletes some pages on POST
exports.pages_delete = asyncHandler(async (req, res, next) => {
  
  let url_website = decodeURIComponent(req.params.url);
  
  const website = await website_controller.get_website(url_website);
  if (website === null) {
    const err = new Error("Website not found");
    err.status = 404;
    return next(err);
  }

  let pagesToDelete = req.body;
  
  try {
    for (const pageData of pagesToDelete) {
      const pageUrl = decodeURIComponent(pageData.url);
      
      // Find the page by URL
      const [page] = await Promise.all([
        Page.findOne({ url: pageUrl }).exec(),
      ]);
      if (page) {
        //Get the evaluation associated to the page
        const eval_id = page.evaluation;
        if (eval_id) {
          // Delete the evaluation
          await evaluation_controller.evaluation_delete(eval_id);
        }

        // Remove the page from the website's list of pages
        website.pages = website.pages.filter(pageId => !pageId.equals(page._id));
        
        // Delete the page from the database
        await Page.deleteOne({ _id: page._id });
      }
    }

    // Update website on the database.
    await website.save();
  
    res.json({ message: 'All pages deleted successfully' });

  } catch (error) {
    next(error);
  }
});


exports.get_page = asyncHandler(async (url) => {
  
  // Get details of page
  const [page] = await Promise.all([
    Page.findOne({ url: url }).exec(),
  ]);
  if (page === null) {
    // No results.
    return null;
  }
  return page;
});


exports.delete_page = asyncHandler(async (url_page) => {

  // Find the page by URL
  const [page] = await Promise.all([
    Page.findOne({ url: url_page }).exec(),
  ]);
  if (page) {
    //Get the evaluation associated to the page
    const eval_id = page.evaluation;
    if (eval_id) {
      // Delete the evaluation
      await evaluation_controller.evaluation_delete(eval_id);
    }

    // Delete the page from the database
    await Page.deleteOne({ _id: page._id });
  }
});