import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import TVLayout from './layout'

describe('TVLayout', () => {
  it('renders children', () => {
    render(
      <TVLayout modal={null}>
        <div data-testid="page-content">Page content</div>
      </TVLayout>
    )

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })

  it('renders modal slot when provided', () => {
    render(
      <TVLayout modal={<div data-testid="modal-content">Modal</div>}>
        <div>Page</div>
      </TVLayout>
    )

    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
  })

  it('renders both children and modal together', () => {
    render(
      <TVLayout modal={<div data-testid="modal">Modal</div>}>
        <div data-testid="page">Page</div>
      </TVLayout>
    )

    expect(screen.getByTestId('page')).toBeInTheDocument()
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('renders nothing extra when modal is null', () => {
    const { container } = render(
      <TVLayout modal={null}>
        <div data-testid="only-child">Only child</div>
      </TVLayout>
    )

    expect(screen.getByTestId('only-child')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-testid]')).toHaveLength(1)
  })
})
