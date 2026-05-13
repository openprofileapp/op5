import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'

import i18n from '../_common/i18n.js'

import "../_common/styles/tailwind.css";
import "../_common/styles/app.css"
import "./scripts/main.js";

import Home from './pages/Home.js'
import SearchProfiles from './pages/SearchProfiles.js'
import Partners from './pages/Partners.js'
import Premium from './pages/Premium.js'

import ComingSoon from './pages/ComingSoon.js'
import NotFound from './pages/NotFound.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profiles" element={<SearchProfiles />} />
                        <Route path="/universes" element={<ComingSoon />} />
                        <Route path="/library" element={<ComingSoon />} />
                        <Route path="/partners" element={<Partners />} />
                        <Route path="/premium" element={<Premium />} />
                        
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                </BrowserRouter>
            </I18nextProvider>
        </HelmetProvider>
    </React.StrictMode>
)