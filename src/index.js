import {Map} from 'immutable'
import {
  ContentBlock,
  ContentState,
  EditorState,
  genKey,
} from 'draft-js'

import {
  NEWLINE_REGEX,
  replaceNewlines,
  condenseBlocks,
  stripEntityFromCharacterMetadata,
  characterListhasEntities,
} from './utils'

/**
 * Default options
 * @type {Object}
 */
const defaultOptions = {
  stripEntities: true,
}

/**
 * Single Line Plugin
 * @param  {Object} options Per-instance options to override the defaults
 * @return {Object} Compatible draft-js-editor-plugin object
 */
function singleLinePlugin (options = {}) {
  options = Object.assign({}, defaultOptions, options)

  return {
    /**
     * Return a compatible blockRenderMap
     *
     * NOTE: Needs to be explicitly applied, the plugin system doesn’t do
     * anything with this at the moment.
     *
     * @type {ImmutableMap}
     */
    blockRenderMap: Map({
      'unstyled': {
        element: 'div',
      },
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
    onChange (editorState) {
      const blocks = editorState.getCurrentContent().getBlocksAsArray()

      // If we have more than one block, compress them
      if (blocks.length > 1) {
        editorState = condenseBlocks(editorState, blocks, options)
      } else {
        // We only have one content block
        let contentBlock = blocks[0]
        let text = contentBlock.getText()
        let characterList = contentBlock.getCharacterList()
        let hasEntitiesToStrip = options.stripEntities && characterListhasEntities(characterList)

        if (NEWLINE_REGEX.test(text) || hasEntitiesToStrip) {
          // Replace the text stripped of its newlines. Note that we replace
          // one '\n' with one ' ' so we don't need to modify the characterList
          text = replaceNewlines(text)

          // Strip entities?
          if (options.stripEntities) {
            characterList = characterList.map(stripEntityFromCharacterMetadata)
          }

          // Create a new content block based on the old one
          contentBlock = new ContentBlock({
            key: genKey(),
            text: text,
            type: 'unstyled',
            characterList: characterList,
            depth: 0,
          })

          // Update the editor state with the compressed version
          // const selection = editorState.getSelection()
          const newContentState = ContentState.createFromBlockArray([contentBlock])

          // Create the new state as an undoable action
          editorState = EditorState.push(editorState, newContentState, 'insert-characters')
        }
      }

      return editorState
    },

    /**
     * Stop new lines being inserted by always handling the return
     *
     * @param  {KeyboardEvent} e Synthetic keyboard event from draftjs
     * @return {String} Did we handle the return or not? (pro-trip: yes, we did)
     */
    handleReturn (e) {
      return "handled"
    },
  }
}

export default singleLinePlugin
