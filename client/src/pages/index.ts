import { lazy } from 'react';

export const Home = lazy(() => import('./home'));
export const History = lazy(() => import('./history'));
export const Login = lazy(() => import('./login'));
export const Register = lazy(() => import('./register'));
export const Profile = lazy(() => import('./profile'));
export const NotFound = lazy(() => import('./not-found'));
export const ReviewDetail = lazy(() => import('./review-detail'));
export const Freestyle = lazy(() => import('./freestyle'));
