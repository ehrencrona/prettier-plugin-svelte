import { Doc } from 'prettier';
import { debugPrint, docToString } from '../../test/debugprint';

/**
 * Trims both leading and trailing nodes matching `isWhitespace` independent of nesting level 
 * (though all trimmed adjacent nodes need to be a the same level). Modifies the `docs` array.
 */
export function trim(docs: Doc[], isWhitespace: (doc: Doc) => boolean): Doc[] {
    const trimmedLeft = trimLeft(docs, isWhitespace);

    if (trimmedLeft) {
        debugPrint(`trimmed left ${trimmedLeft.map(docToString).join(', ')}`)
    }

    const trimmedRight = trimRight(docs, isWhitespace);

    if (trimmedRight) {
        debugPrint(`trimmed right ${trimmedRight.map(docToString).join(', ')}`)
    }

    return docs
}

/**
 * Trims the leading nodes matching `isWhitespace` independent of nesting level (though all nodes need to be a the same level)
 * and returnes the removed nodes.
 */
export function trimLeft(group: Doc[], isWhitespace: (doc: Doc) => boolean): Doc[] | undefined {
    let firstNonWhitespace = group.findIndex((doc) => !isWhitespace(doc));

    if (firstNonWhitespace < 0 && group.length) {
        firstNonWhitespace = group.length
    }

    if (firstNonWhitespace > 0) {
        return group.splice(0, firstNonWhitespace);
    } else {
        const parts = getParts(group[0]);

        if (parts) {
            return trimLeft(parts, isWhitespace);
        }
    }
}

/**
 * Trims the trailing nodes matching `isWhitespace` independent of nesting level (though all nodes need to be a the same level)
 * and returnes the removed nodes.
 */
export function trimRight(group: Doc[], isWhitespace: (doc: Doc) => boolean): Doc[] | undefined {
    let lastNonWhitespace = group.length ? findLastIndex((doc) => !isWhitespace(doc), group) : 0;

    if (lastNonWhitespace < group.length-1) {
        return group.splice(lastNonWhitespace+1);
    } else {
        const parts = getParts(group[group.length - 1]);

        if (parts) {
            return trimRight(parts, isWhitespace);
        }
    }
}

function getParts(doc: Doc): Doc[] | undefined {
    if (typeof doc === 'object' && (doc.type === 'fill' || doc.type === 'concat')) {
        return doc.parts;
    }
}

function findLastIndex<T>(filter: (item: T) => boolean, items: T[]) {
    for (let i = items.length - 1; i >= 0; i--) {
        if (filter(items[i])) {
            return i;
        }
    }

    return -1;
}