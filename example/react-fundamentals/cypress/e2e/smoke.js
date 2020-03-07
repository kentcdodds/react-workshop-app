describe('the example app', () => {
  it('passes smoke tests', () => {
    cy.visit('/')
    cy.findByText(/basic.*hello world/i).click()
    cy.findByText(/basic.*hello world/i, {selector: 'h1'}).should('exist')
    cy.findByText(/exercise.*isolated/i).click()
    cy.go('back')
    cy.findByText(/final/i, {selector: 'button'}).click()
    cy.findByText(/final.*isolated/i).click()
    cy.findByText('Hello World').should('exist')
    cy.go('back')
    cy.findByText(/react fundamentals/i, {selector: 'h1'}).click()
    cy.location().should(loc => expect(loc.pathname).to.eq('/'))

    cy.findByText(/intro to raw react apis/i).click()
    cy.findByText(/nesting elements/i, {selector: 'a'}).click()
    cy.go('back')
    // cy.findAllByText(/using jsx/i, {selector: 'a'}).click()

    cy.visit('/isolated/final/08.js')
    cy.findByLabelText(/username/i).type('animal crackers')
    cy.findByText(/submit/i).click()
  })
})
