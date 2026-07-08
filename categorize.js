/* ===========================================================
   MoodSort — category mapping
   MobileNet returns 1 of 1,000 very specific ImageNet labels
   (e.g. "Siamese cat", "suspension bridge"). For a moodboard,
   that's too granular — this maps raw labels into a handful of
   broad, design-friendly buckets via whole-word keyword matching.
   =========================================================== */

const CATEGORY_KEYWORDS = {
  Animals: [
    'cat', 'dog', 'bird', 'horse', 'lion', 'tiger', 'bear', 'fish', 'insect',
    'butterfly', 'spider', 'snake', 'turtle', 'rabbit', 'fox', 'wolf', 'deer',
    'elephant', 'zebra', 'monkey', 'sheep', 'cow', 'goat', 'duck', 'owl',
    'eagle', 'parrot', 'frog', 'lizard', 'crab', 'shark', 'whale', 'seal',
    // common dog/cat breed words — ImageNet labels are usually specific breeds,
    // not the generic word "dog" or "cat"
    'retriever', 'terrier', 'hound', 'spaniel', 'shepherd', 'poodle',
    'bulldog', 'collie', 'setter', 'pointer', 'mastiff', 'chihuahua',
    'dachshund', 'corgi', 'husky', 'malamute', 'pug', 'boxer', 'doberman',
    'rottweiler', 'beagle', 'pomeranian', 'dalmatian', 'puppy', 'tabby',
    'persian', 'siamese', 'kitten'
  ],
  People: [
    'person', 'man', 'woman', 'suit', 'dress', 'shirt', 'jean', 'sunglass',
    'sunglasses', 'hat', 'shoe', 'sandal', 'groom', 'bride', 'ballplayer',
    'diver', 'miniskirt', 'kimono', 'cowboy', 'gown'
  ],
  Objects: [
    'chair', 'lamp', 'laptop', 'phone', 'bottle', 'bag', 'clock', 'camera',
    'cup', 'mug', 'book', 'pen', 'pencil', 'desk', 'table', 'sofa', 'vase',
    'umbrella', 'watch', 'necklace', 'ring', 'basket', 'box', 'bicycle',
    'bike', 'car'
  ],
  Food: [
    'pizza', 'burger', 'cheeseburger', 'hamburger', 'cake', 'fruit',
    'vegetable', 'coffee', 'wine', 'bread', 'soup', 'ice cream', 'pasta',
    'sandwich', 'salad', 'sushi', 'pancake', 'banana', 'orange',
    'strawberry', 'pretzel', 'taco', 'burrito', 'guacamole', 'meatloaf'
  ],
  Architecture: [
    'building', 'bridge', 'castle', 'church', 'tower', 'house', 'skyscraper',
    'palace', 'dome', 'monastery', 'mosque', 'stupa', 'window', 'door',
    'library', 'museum', 'stairway', 'fence', 'greenhouse', 'barn',
    'cathedral'
  ],
  Nature: [
    'tree', 'mountain', 'beach', 'flower', 'forest', 'lake', 'sky', 'plant',
    'leaf', 'ocean', 'sea', 'seashore', 'valley', 'cliff', 'volcano',
    'coral', 'sand', 'sandbar', 'sunset', 'sunrise', 'cloud', 'rock',
    'stone', 'grass', 'field', 'river', 'waterfall', 'island', 'desert',
    'snow', 'ice'
  ]
};

// Priority matters: earlier categories are checked first when a label's
// words could plausibly match more than one bucket (e.g. "coffee mug" has
// both a Food word and an Objects word — Objects wins because the photo
// is of an object, not a beverage).
const CATEGORY_PRIORITY = ['Animals', 'People', 'Objects', 'Food', 'Architecture', 'Nature'];
const CATEGORY_ORDER = [...CATEGORY_PRIORITY, 'Other'];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word / whole-phrase match, so short keywords like "cat" or "cow"
 * don't false-match inside unrelated words like "cathedral" or "cowboy".
 */
function containsKeyword(label, keyword) {
  const pattern = new RegExp('\\b' + escapeRegex(keyword) + '\\b', 'i');
  return pattern.test(label);
}

/**
 * Maps a raw classification label to one of the broad moodboard categories.
 */
function categorizeLabel(rawLabel) {
  const label = String(rawLabel).toLowerCase();

  for (const category of CATEGORY_PRIORITY) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some(kw => containsKeyword(label, kw))) {
      return category;
    }
  }
  return 'Other';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { categorizeLabel, CATEGORY_ORDER, CATEGORY_KEYWORDS };
}
