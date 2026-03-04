import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from '@/components/layout'
import { HomePage } from '@/pages/home'
import { WorkspacePage } from '@/pages/workspace'
import { ProjectSettingsPage } from '@/pages/project-settings'
import { FullTextPage } from '@/pages/full-text'
import { SettingsPage } from '@/pages/settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<WorkspacePage />} />
          <Route path="/project/:id/settings" element={<ProjectSettingsPage />} />
          <Route path="/project/:id/full-text" element={<FullTextPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
