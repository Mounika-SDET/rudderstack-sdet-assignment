Feature: Rudderstack basic flow

  Scenario: Send event and verify webhook destination receives it
    Given I log in to RudderStack
    And I navigate to the Connections page
    And I capture the Data Plane URL
    And I capture the Write Key for the HTTP source named "HTTP-Source"
    When I send a track event via API
    Then I open the webhook destination named "Webhook-Destination" and verify delivered count increased