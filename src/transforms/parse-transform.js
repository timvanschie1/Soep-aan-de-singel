const jsdom = require('@tbranyen/jsdom');
const {JSDOM} = jsdom;
const minify = require('../utils/minify.js');
const slugify = require('slugify');

module.exports = function(value, outputPath) {
  if (outputPath.endsWith('.html')) {
    const DOM = new JSDOM(value, {
      resources: 'usable'
    });

    const document = DOM.window.document;
    const articleImages = [...document.querySelectorAll('main article img')];
    const articleHeadings = [
      ...document.querySelectorAll('main article h2, main article h3')
    ];
    const articleEmbeds = [...document.querySelectorAll('main article iframe')];

    if (articleImages.length) {
      articleImages.forEach(image => {
        image.setAttribute('loading', 'lazy');

        // If an image has a title it means that the user added a caption
        // so replace the image with a figure containing that image and a caption
        if (image.hasAttribute('title')) {
          const figure = document.createElement('figure');
          const figCaption = document.createElement('figcaption');

          figCaption.innerHTML = image.getAttribute('title');

          image.removeAttribute('title');

          figure.appendChild(image.cloneNode(true));
          figure.appendChild(figCaption);

          image.replaceWith(figure);
        }
      });
    }

    // Look for videos are wrap them in a container element
    if (articleEmbeds.length) {
      articleEmbeds.forEach(embed => {
        if (embed.hasAttribute('allowfullscreen')) {
          const player = document.createElement('div');

          player.classList.add('videos-player');

          player.appendChild(embed.cloneNode(true));

          embed.replaceWith(player);
        }
      });
    }

    return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML;
  }
  return value;
};
