import { createContext, useContext, useState, useEffect } from 'react'

const SavedJobsContext = createContext(null)
const STORAGE_KEY = 'datahive_saved_jobs'

export function SavedJobsProvider(props) {
  const [savedIds, setSavedIds] = useState([])

  useEffect(function () {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSavedIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load saved jobs', e)
    }
  }, [])

  function persist(ids) {
    setSavedIds(ids)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch (e) {
      console.error('Failed to save jobs', e)
    }
  }

  function isSaved(jobId) {
    return savedIds.includes(jobId)
  }

  function toggleSave(jobId) {
    if (savedIds.includes(jobId)) {
      persist(savedIds.filter(function (id) { return id !== jobId }))
    } else {
      persist([...savedIds, jobId])
    }
  }

  const value = {
    savedIds: savedIds,
    isSaved: isSaved,
    toggleSave: toggleSave,
  }

  return <SavedJobsContext.Provider value={value}>{props.children}</SavedJobsContext.Provider>
}

export function useSavedJobs() {
  return useContext(SavedJobsContext)
}