import {
  ContentBlock,
  ContentState,
  EditorState,
  genKey,
} from 'draft-js'
import {List} from 'immutable'

/**
 * Greedy regex for matching newlines
 * @type {RegExp}
 */
export const NEWLINE_REGEX = /\n/g

/**
 * Replace newline characters with the passed string
 * @param  {String} str String to replace
 * @param  {String} replacement Replacement characters
 * @return {String} Modified string
 */
export function replaceNewlines (str, replacement = ' ') {
  return str.replace(NEWLINE_REGEX, replacement)
}

/**
 * Condense an array of content blocks into a single block
 * @param  {EditorState} editorState draft-js EditorState instance
 * @param  {Array} blocks Array of ContentBlocks
 * @param  {Object} options
 * @return {EditorState} A modified EditorState instance
 */
export function condenseBlocks (editorState, blocks, options) {
  blocks = blocks || editorState.getCurrentContent().getBlocksAsArray()
  let text = List()
  let characterList = List()

  // Gather all the text/characterList and concat them
  blocks.forEach((block) => {
    // Atomic blocks should be ignored (stripped)
    if (block.getType() !== 'atomic') {
      if (options.stripNewlines) {
        text = text.push(replaceNewlines(block.getText()))
      } else {
        text = text.push(block.getText())
      }
      characterList = characterList.concat(block.getCharacterList())
    }
  })

  // Strip entities?
  if (options.stripEntities) {
    characterList = characterList.map(stripEntityFromCharacterMetadata)
  }

  // Create a new content block
  const contentBlock = new ContentBlock({
    key: genKey(),
    text: text.join(''),
    type: 'unstyled',
    characterList: characterList,
    depth: 0,
  })

  // Update the editor state with the compressed version
  const newContentState = ContentState.createFromBlockArray([contentBlock])
  // Create the new state as an undoable action
  editorState = EditorState.push(editorState, newContentState, 'remove-range')
  // Move the selection to the end
  return EditorState.moveFocusToEnd(editorState)
}

/**
 * Strip any `entity` keys from a CharacterMetadata set
 * @param  {CharacterMetadata} characterMeta An Immutable.Record representing the metadata for an individual character
 * @return {CharacterMetadata}
 */
export function stripEntityFromCharacterMetadata (characterMeta) {
  return characterMeta.set('entity', null)
}

/**
 * Check if a CharacterList contains entities
 * @param  {CharacterList} characterList The list of characters to check
 * @return {Boolean} Contains entities?
 */
export function characterListhasEntities (characterList) {
  let hasEntities = false
  characterList.forEach((characterMeta) => {
    if (characterMeta.get('entity') !== null) {
      hasEntities = true
    }
  })
  return hasEntities
}
