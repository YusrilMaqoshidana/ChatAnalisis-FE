// src/services/resultsApi.ts
import axios from 'axios'
import type { ResultsSummary, TopicDetail, MessageContext } from '@/types/results'

export function fetchResults(jobId: string) {
  return axios.get<ResultsSummary>(`/api/results/${jobId}`)
}

export function fetchTopicDetail(jobId: string, topicId: number) {
  return axios.get<TopicDetail>(`/api/results/${jobId}/topics/${topicId}`)
}

export function fetchMessageContext(jobId: string, messageId: string) {
  return axios.get<MessageContext>(`/api/results/${jobId}/messages/${messageId}/context`)
}
