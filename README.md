# VIE - Viewer, Interactor, Entity

VIE is a design pattern for separating your data access and application logic layers. VIE fits into the traditional MVC (Model, View, Controller) pattern, by specifying how the Models should be designed. VIE does not specify how your Controllers or Views should be designed, so the developer is free to use whatever design pattern they prefer for those aspects of the system.

## Core Concepts

The three components of VIE are the Viewer, Interactors, and Entities. 

**Entities** are the basic building blocks for the application logic. An entity class typically represents a single table in a database, similar to Models in MVC. In VIE, however, the Entities are only responsible for locating and reading the records. Entities are fundamentally read-only structures and do not control modifying the underlying data source.

**Interactors** are methods responsible for mutating the underlying data source and may also be used to organize an otherwise complex query. The interactor is responsible for managing the access control for the mutation.

The **Viewer** is the owner of the underlying data source connection and is responsible for providing that connection to Entities and Interactors. The Viewer also provides authentication information to these so that they may enforce access controls as desired.