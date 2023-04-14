/**
 * @format
 */

import 'react-native';
import React from 'react';
import Index from '../../index';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<Index />);
});

// TODO
// Things to do based on User Feedback:
// 1.  add color to popup modal buttons Yes - green,  No - red etc. (and have them on the same side for all modals, for consistency)
// 2.  for page number on search screen, say page X of Y
// 3.  switch to pastel colors?
// 4.  make alerts to the top of the screen, just like scan history (new at the top)
// 5.  update message after finding an image to scan, "It is suggested that you crop the image to just include the ingredients if possible, for better and faster results" and make scan button more visible
// 6.  reduce the number of clicks for barcode scanning - dont show barcode modal
// 7.  have feedback on screen when pressing "confirm" after updating allergens on profile screen
// 8.  have notifications on by default, when you scan a product instead of off
// 9.  add text like "Scan Mode: Barcode/Ingredients/Both" alongside the icon on scan screen
// 10. indicate if ingredients were translated, and have ability to switch back to original text
// 11. help icon in top corner of scan, with instructions on how to scan barcode/ingredients, "point camera at product, then when circular button at the bottom of scan screen turns red, press it etc."
// [DONE] 12. show the string that fuzzy match was found in for ingredients scanning. also stop detecting "oyster" for "butter" etc.
// 13. when barcode not found in OFF database, add link where they can add it themselves to help future users( just like when ingredients is empty)

