'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _draftJs = require('draft-js');

var _utils = require('./utils');

/**
 * Default options
 * @type {Object}
 */
var defaultOptions = {
  stripEntities: true
};

/**
 * Single Line Plugin
 * @param  {Object} options Per-instance options to override the defaults
 * @return {Object} Compatible draft-js-editor-plugin object
 */
function singleLinePlugin() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  options = Object.assign({}, defaultOptions, options);

  return {
    /**
     * Return a compatible blockRenderMap
     *
     * NOTE: Needs to be explicitly applied, the plugin system doesn’t do
     * anything with this at the moment.
     *
     * @type {ImmutableMap}
     */
    blockRenderMap: (0, _immutable.Map)({
      'unstyled': {
        element: 'div'
      }
    }),

    /**
     * onChange
     *
     * Condense multiple blocks into a single block and (optionally) strip all
     * entities from the content of that block.
     *
     * @param  {EditorState} editorState The current state of the editor
     * @return {EditorState} A new editor state
     */
    onChange: function onChange(editorState) {
      var blocks = editorState.getCurrentContent().getBlocksAsArray();

      // If we have more than one block, compress them
      if (blocks.length > 1) {
        editorState = (0, _utils.condenseBlocks)(editorState, blocks, options);
      } else {
        // We only have one content block
        var contentBlock = blocks[0];
        var text = contentBlock.getText();
        var characterList = contentBlock.getCharacterList();

        if (_utils.NEWLINE_REGEX.test(text) || (0, _utils.characterListhasEntities)(characterList)) {
          // Replace the text stripped of its newlines. Note that we replace
          // one '\n' with one ' ' so we don't need to modify the characterList
          text = (0, _utils.replaceNewlines)(text);

          // Strip entities?
          if (options.stripEntities) {
            characterList = characterList.map(_utils.stripEntityFromCharacterMetadata);
          }

          // Create a new content block based on the old one
          contentBlock = new _draftJs.ContentBlock({
            key: (0, _draftJs.genKey)(),
            text: text,
            type: 'unstyled',
            characterList: characterList,
            depth: 0
          });

          // Update the editor state with the compressed version
          // const selection = editorState.getSelection()
          var newContentState = _draftJs.ContentState.createFromBlockArray([contentBlock]);

          // Create the new state as an undoable action
          editorState = _draftJs.EditorState.push(editorState, newContentState, 'insert-characters');
          editorState = _draftJs.EditorState.moveFocusToEnd(editorState);
        }
      }

      return editorState;
    },


    /**
     * Stop new lines being inserted by always handling the return
     *
     * @param  {KeyboardEvent} e Synthetic keyboard event from draftjs
     * @return {Boolean} Did we handle the return or not? (pro-trip: yes, we did)
     */
    handleReturn: function handleReturn(e) {
      return true;
    }
  };
}

exports.default = singleLinePlugin;