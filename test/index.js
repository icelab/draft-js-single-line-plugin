import test from 'tape'
import isFunction from 'is-function'
import {Map} from 'immutable'
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
} from 'draft-js'
import createSingleLinePlugin from '../src'
import content from './fixtures/content'

test('it should create a draft-js plugin', (nest) => {
  const singleLinePlugin = createSingleLinePlugin()
  const singleLinePluginWithEntities = createSingleLinePlugin({stripEntities: false})
  const contentState = convertFromRaw(content)
  const editorState = EditorState.createWithContent(contentState)

  nest.test('... with the correct exports', (assert) => {
    assert.ok(isFunction(singleLinePlugin.onChange), 'onChange is a function')
    assert.ok(isFunction(singleLinePlugin.handleReturn), 'handleReturn is a function')
    assert.ok(Map.isMap(singleLinePlugin.blockRenderMap), 'blockRenderMap is a Map')
    assert.end()
  })

  nest.test('... handleReturn should always return true', (assert) => {
    assert.ok(singleLinePlugin.handleReturn(), 'handleReturn returns true')
    assert.end()
  })

  nest.test('... it should condense an `EditorState` to a single block', (assert) => {
    const modifiedEditorState = singleLinePlugin.onChange(editorState)
    assert.equal(
      editorState.getCurrentContent().getBlocksAsArray().length,
      6,
      'Original blocks.length is 6'
    )
    assert.equal(
      modifiedEditorState.getCurrentContent().getBlocksAsArray().length,
      1,
      'Modified blocks.length is 1'
    )
    assert.end()
  })

  nest.test('... it should strip entities from an `EditorState`', (assert) => {
    const modifiedEditorState = singleLinePlugin.onChange(editorState)
    assert.notDeepEqual(
      convertToRaw(editorState.getCurrentContent()).entityMap,
      {},
      'Original entityMap is not empty'
    )
    assert.deepEqual(
      convertToRaw(modifiedEditorState.getCurrentContent()).entityMap,
      {},
      'Modified entityMap is empty'
    )
    assert.end()
  })

  nest.test('... unless `stripEntities` is set to `false`', (assert) => {
    const modifiedEditorState = singleLinePluginWithEntities.onChange(editorState)
    assert.notDeepEqual(
      convertToRaw(editorState.getCurrentContent()).entityMap,
      {},
      'Original entityMap is not empty'
    )
    assert.notDeepEqual(
      convertToRaw(modifiedEditorState.getCurrentContent()).entityMap,
      {},
      'Modified entityMap is not empty'
    )
    assert.end()
  })
})
