import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table, TBody, TD, TH, THead, TR } from '@/components/mdx/Table'

describe('Table components', () => {
  it('Table renders children inside a table element', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </Table>,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Cell')).toBeInTheDocument()
  })

  it('THead renders with colored background className', () => {
    const { container } = render(
      <table>
        <THead>
          <tr>
            <th>Header</th>
          </tr>
        </THead>
      </table>,
    )

    expect(container.querySelector('thead')).toHaveClass('bg-hub-primary/[0.08]', 'dark:bg-coinbase-blue/[0.12]')
  })

  it('TBody renders with alternating stripe className', () => {
    const { container } = render(
      <table>
        <TBody>
          <tr>
            <td>One</td>
          </tr>
          <tr>
            <td>Two</td>
          </tr>
        </TBody>
      </table>,
    )

    expect(container.querySelector('tbody')).toHaveClass(
      '[&>tr:nth-child(even)]:bg-hub-surface-alt/50',
      'dark:[&>tr:nth-child(even)]:bg-white/[0.03]',
    )
  })

  it('TR renders with hover highlight className', () => {
    const { container } = render(
      <table>
        <tbody>
          <TR>
            <td>Row</td>
          </TR>
        </tbody>
      </table>,
    )

    expect(container.querySelector('tr')).toHaveClass('hover:bg-hub-primary/[0.04]', 'dark:hover:bg-coinbase-blue/[0.06]')
  })

  it('TH renders with uppercase styling className', () => {
    render(
      <table>
        <thead>
          <tr>
            <TH>Title</TH>
          </tr>
        </thead>
      </table>,
    )

    const headerCell = screen.getByRole('columnheader', { name: 'Title' })
    expect(headerCell).toHaveClass('uppercase', 'tracking-wider', 'font-bold')
  })

  it('TD renders children', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TD>Body value</TD>
          </tr>
        </tbody>
      </table>,
    )

    expect(screen.getByRole('cell', { name: 'Body value' })).toBeInTheDocument()
  })

  it('renders full table composition correctly', () => {
    render(
      <Table>
        <THead>
          <TR>
            <TH>Column A</TH>
            <TH>Column B</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Value A1</TD>
            <TD>Value B1</TD>
          </TR>
        </TBody>
      </Table>,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Column A' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Column B' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Value A1' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Value B1' })).toBeInTheDocument()
  })
})
