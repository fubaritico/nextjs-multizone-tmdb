import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ModalDefault from './default'

describe('MovieModalDefault', () => {
  it('renders nothing', () => {
    const { container } = render(<ModalDefault />)

    expect(container).toBeEmptyDOMElement()
  })
})
