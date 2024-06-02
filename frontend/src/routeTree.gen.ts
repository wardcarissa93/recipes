/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AboutImport } from './routes/about'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as AuthenticatedIndexImport } from './routes/_authenticated/index'
import { Route as AuthenticatedSearchResultsImport } from './routes/_authenticated/search-results'
import { Route as AuthenticatedSearchImport } from './routes/_authenticated/search'
import { Route as AuthenticatedProfileImport } from './routes/_authenticated/profile'
import { Route as AuthenticatedMyRecipesImport } from './routes/_authenticated/my-recipes'
import { Route as AuthenticatedIngredientsImport } from './routes/_authenticated/ingredients'
import { Route as AuthenticatedEditIngredientImport } from './routes/_authenticated/edit-ingredient'
import { Route as AuthenticatedCreateRecipeImport } from './routes/_authenticated/create-recipe'
import { Route as AuthenticatedCreateIngredientImport } from './routes/_authenticated/create-ingredient'
import { Route as AuthenticatedRecipeRecipeIdImport } from './routes/_authenticated/recipe.$recipeId'

// Create/Update Routes

const AboutRoute = AboutImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedIndexRoute = AuthenticatedIndexImport.update({
  path: '/',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedSearchResultsRoute = AuthenticatedSearchResultsImport.update(
  {
    path: '/search-results',
    getParentRoute: () => AuthenticatedRoute,
  } as any,
)

const AuthenticatedSearchRoute = AuthenticatedSearchImport.update({
  path: '/search',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProfileRoute = AuthenticatedProfileImport.update({
  path: '/profile',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedMyRecipesRoute = AuthenticatedMyRecipesImport.update({
  path: '/my-recipes',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedIngredientsRoute = AuthenticatedIngredientsImport.update({
  path: '/ingredients',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedEditIngredientRoute =
  AuthenticatedEditIngredientImport.update({
    path: '/edit-ingredient',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedCreateRecipeRoute = AuthenticatedCreateRecipeImport.update({
  path: '/create-recipe',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedCreateIngredientRoute =
  AuthenticatedCreateIngredientImport.update({
    path: '/create-ingredient',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedRecipeRecipeIdRoute =
  AuthenticatedRecipeRecipeIdImport.update({
    path: '/recipe/$recipeId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authenticated': {
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/create-ingredient': {
      preLoaderRoute: typeof AuthenticatedCreateIngredientImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/create-recipe': {
      preLoaderRoute: typeof AuthenticatedCreateRecipeImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/edit-ingredient': {
      preLoaderRoute: typeof AuthenticatedEditIngredientImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/ingredients': {
      preLoaderRoute: typeof AuthenticatedIngredientsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/my-recipes': {
      preLoaderRoute: typeof AuthenticatedMyRecipesImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/profile': {
      preLoaderRoute: typeof AuthenticatedProfileImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/search': {
      preLoaderRoute: typeof AuthenticatedSearchImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/search-results': {
      preLoaderRoute: typeof AuthenticatedSearchResultsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/': {
      preLoaderRoute: typeof AuthenticatedIndexImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/recipe/$recipeId': {
      preLoaderRoute: typeof AuthenticatedRecipeRecipeIdImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  AuthenticatedRoute.addChildren([
    AuthenticatedCreateIngredientRoute,
    AuthenticatedCreateRecipeRoute,
    AuthenticatedEditIngredientRoute,
    AuthenticatedIngredientsRoute,
    AuthenticatedMyRecipesRoute,
    AuthenticatedProfileRoute,
    AuthenticatedSearchRoute,
    AuthenticatedSearchResultsRoute,
    AuthenticatedIndexRoute,
    AuthenticatedRecipeRecipeIdRoute,
  ]),
  AboutRoute,
])

/* prettier-ignore-end */
