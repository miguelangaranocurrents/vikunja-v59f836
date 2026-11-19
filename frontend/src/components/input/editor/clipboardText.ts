import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain text for copies out of the editor. ProseMirror's default flattens lists into
// bare lines, which loses the list structure the user copied.
export function serializeSliceAsText(slice: Slice): string {
	return blocksToText(slice.content)
}

function blocksToText(fragment: Fragment): string {
	const blocks: string[] = []
	fragment.forEach(node => {
		blocks.push(isList(node) ? listToText(node, '') : node.textContent)
	})
	return blocks.join('\n\n')
}

function isList(node: ProseMirrorNode): boolean {
	return node.type.name === 'bulletList' || node.type.name === 'orderedList'
}

function listToText(list: ProseMirrorNode, indent: string): string {
	const ordered = list.type.name === 'orderedList'
	const lines: string[] = []

	list.forEach((item, _offset, index) => {
		const marker = ordered ? `${index + 1}. ` : '- '
		const continuation = indent + ' '.repeat(marker.length)

		item.forEach((child, _childOffset, childIndex) => {
			if (isList(child)) {
				lines.push(listToText(child, continuation))
			} else if (childIndex === 0) {
				lines.push(indent + marker + child.textContent)
			} else {
				lines.push(continuation + child.textContent)
			}
		})
	})

	return lines.join('\n')
}
