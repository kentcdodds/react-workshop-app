describe('the example app', () => {
  it('passes smoke tests', () => {
    cy.visit('/')
    cy.findByText(/basic.*hello world/i).click()
    cy.findByText(/exercise/i).click()
    cy.go('back')
    cy.findByText(/final/i).click()
    cy.findByText('Hello World').should('exist')
    cy.go('back')
    cy.findByText(/home/i).click()
    cy.location().should(loc => expect(loc.pathname).to.eq('/'))

    cy.findByText(/intro to raw react apis/i).click()
    cy.findByText(/nesting elements/i).click()
    cy.go('back')
    cy.findByText(/using jsx/i).click()

    cy.visit('/isolated/final/08.js')
    cy.findByLabelText(/username/i).type('animal crackers')
    cy.findByText(/submit/i).click()
  })
})
