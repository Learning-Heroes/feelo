## MODIFIED Requirements

### Requirement: Discover is the initial tab
When the signed-in app opens, the `Descubre` tab SHALL be selected and its screen SHALL be the Discover screen. The Discover route SHALL render only the Discover screen, with no other element.

#### Scenario: App start selects Descubre
- **WHEN** a signed-in user opens the app
- **THEN** the `Descubre` item is selected and the Discover screen is visible

#### Scenario: Thin Discover route
- **WHEN** the Discover route renders
- **THEN** it returns only `<DiscoverScreen />`

### Requirement: Placeholder tab screens
The `Sugerir` and `Perfil` screens SHALL show their title text (`Sugerir` / `Perfil`) on the Noche background. The title SHALL use the Brand book Title role (Sora 800, 24–28 px, tracking −2%). `Sugerir` SHALL contain no other element. Until the Profile task, `Perfil` SHALL also contain the temporary logout button (`Cerrar sesión`), and nothing else.

#### Scenario: Placeholder screens have only a title
- **WHEN** the `Sugerir` screen renders
- **THEN** it contains exactly one text node, whose text is its title

#### Scenario: Perfil holds the temporary logout button
- **WHEN** the `Perfil` screen renders
- **THEN** it shows the `Perfil` title and a `Cerrar sesión` button, and no other element
