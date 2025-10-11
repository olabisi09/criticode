import { lazy } from 'react';

// Lazy load all pages for code splitting
export const Home = lazy(() => import('./Home'));
export const History = lazy(() => import('./History'));
export const Login = lazy(() => import('./Login'));
export const Profile = lazy(() => import('./Profile'));
export const NotFound = lazy(() => import('./NotFound'));
export const ReviewDetail = lazy(() => import('./ReviewDetail'));
export const Freestyle = lazy(() => import('./Freestyle'));
