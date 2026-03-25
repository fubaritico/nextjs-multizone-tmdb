import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MovieLayout from './layout'

describe('MovieLayout', () => {
  it('renders children', () => {
    render(
      <MovieLayout modal={null}>
        <div data-testid="page-content">Page content</div>
      </MovieLayout>
    )

    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })

  it('renders modal slot when provided', () => {
    render(
      <MovieLayout modal={<div data-testid="modal-content">Modal</div>}>
        <div>Page</div>
      </MovieLayout>
    )

    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
  })

  it('renders both children and modal together', () => {
    render(
      <MovieLayout modal={<div data-testid="modal">Modal</div>}>
        <div data-testid="page">Page</div>
      </MovieLayout>
    )

    expect(screen.getByTestId('page')).toBeInTheDocument()
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('renders nothing extra when modal is null', () => {
    const { container } = render(
      <MovieLayout modal={null}>
        <div data-testid="only-child">Only child</div>
      </MovieLayout>
    )

    expect(screen.getByTestId('only-child')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-testid]')).toHaveLength(1)
  })
})
