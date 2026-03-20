import { render, screen } from '@testing-library/react'

import Home from './page'

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} />
  ),
}))

describe('Home page', () => {
  it('renders the heading', () => {
    render(<Home />)

    expect(
      screen.getByRole('heading', {
        name: /to get started, edit the page\.tsx file/i,
      })
    ).toBeInTheDocument()
  })

  it('renders the documentation link', () => {
    render(<Home />)

    expect(
      screen.getByRole('link', { name: /documentation/i })
    ).toBeInTheDocument()
  })
})
