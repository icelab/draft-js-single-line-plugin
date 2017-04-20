'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NEWLINE_REGEX = undefined;
exports.replaceNewlines = replaceNewlines;
exports.condenseBlocks = condenseBlocks;
exports.stripEntityFromCharacterMetadata = stripEntityFromCharacterMetadata;
exports.characterListhasEntities = characterListhasEntities;

var _draftJs = require('draft-js');

var _immutable = require('immutable');

/**
 * Greedy regex for matching newlines
 * @type {RegExp}
 */
var NEWLINE_REGEX = exports.NEWLINE_REGEX = /\n/g;

/**
 * Replace newline characters with the passed string
 * @param  {String} str String to replace
 * @param  {String} replacement Replacement characters
 * @return {String} Modified string
 */
function replaceNewlines(str) {
  var replacement = arguments.length <= 1 || arguments[1] === undefined ? ' ' : arguments[1];

  return str.replace(NEWLINE_REGEX, replacement);
}

/**
 * Condense an array of content blocks into a single block
 * @param  {EditorState} editorState draft-js EditorState instance
 * @param  {Array} blocks Array of ContentBlocks
 * @param  {Object} options
 * @return {EditorState} A modified EditorState instance
 */
function condenseBlocks(editorState, blocks, options) {
  blocks = blocks || editorState.getCurrentContent().getBlocksAsArray();
  var text = (0, _immutable.List)();
  var characterList = (0, _immutable.List)();

  // Gather all the text/characterList and concat them
  blocks.forEach(function (block) {
    // Atomic blocks should be ignored (stripped)
    if (block.getType() !== 'atomic') {
      text = text.push(replaceNewlines(block.getText()));
      characterList = characterList.concat(block.getCharacterList());
    }
  });

  // Strip entities?
  if (options.stripEntities) {
    characterList = characterList.map(stripEntityFromCharacterMetadata);
  }

  // Create a new content block
  var contentBlock = new _draftJs.ContentBlock({
    key: (0, _draftJs.genKey)(),
    text: text.join(''),
    type: 'unstyled',
    characterList: characterList,
    depth: 0
  });

  // Update the editor state with the compressed version
  var newContentState = _draftJs.ContentState.createFromBlockArray([contentBlock]);
  // Create the new state as an undoable action
  editorState = _draftJs.EditorState.push(editorState, newContentState, 'remove-range');
  // Move the selection to the end
  return _draftJs.EditorState.moveFocusToEnd(editorState);
}

/**
 * Strip any `entity` keys from a CharacterMetadata set
 * @param  {CharacterMetadata} characterMeta An Immutable.Record representing the metadata for an individual character
 * @return {CharacterMetadata}
 */
function stripEntityFromCharacterMetadata(characterMeta) {
  return characterMeta.set('entity', null);
}

/**
 * Check if a CharacterList contains entities
 * @param  {CharacterList} characterList The list of characters to check
 * @return {Boolean} Contains entities?
 */
function characterListhasEntities(characterList) {
  var hasEntities = false;
  characterList.forEach(function (characterMeta) {
    if (characterMeta.get('entity') !== null) {
      hasEntities = true;
    }
  });
  return hasEntities;
}