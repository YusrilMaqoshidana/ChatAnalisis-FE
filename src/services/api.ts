// src/services/api.ts
import axios from 'axios'
import type { ResultsSummaryDTO, TopicDetailDTO, MessageContextDTO } from '@/types/results'

// Configure default base URL for the backend API
axios.defaults.baseURL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

export function fetchResults(jobId: string) {
  return axios.get<ResultsSummaryDTO>(`/api/results/${jobId}`)
}

export function fetchTopicDetail(jobId: string, topicId: number) {
  return axios.get<TopicDetailDTO>(`/api/results/${jobId}/topics/${topicId}`)
}

export function fetchMessageContext(jobId: string, messageId: string) {
  return axios.get<MessageContextDTO>(`/api/results/${jobId}/messages/${messageId}/context`)
}

export function uploadChatFile(csvBlob: Blob, sessionId: string, startDate: string, endDate: string) {
  const formData = new FormData()
  formData.append('file', csvBlob, 'whatsapp_chat.csv')
  formData.append('session_id', sessionId)
  if (startDate) formData.append('startDate', startDate)
  if (endDate) formData.append('endDate', endDate)
  
  return axios.post('/analysis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


