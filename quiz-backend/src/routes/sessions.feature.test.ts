import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../app'

describe('Sessions Feature', () => {
    let studentToken: string
    let adminToken: string

    beforeEach(async () => {
        const studentRes = await app.request('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'test_student' })
        })
        const studentData = await studentRes.json()
        studentToken = studentData.token

        const adminRes = await app.request('/api/auth/github/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'test_teacher' })
        })
        const adminData = await adminRes.json()
        adminToken = adminData.token
    })

    it('GET /api/questions - без токена возвращает 401', async () => {
        const res = await app.request('/api/questions')
        expect(res.status).toBe(401)
    })

    it('GET /api/questions - с токеном возвращает 200', async () => {
        const res = await app.request('/api/questions', {
            headers: { Authorization: `Bearer ${studentToken}` }
        })
        expect(res.status).toBe(200)
    })
    it('POST /api/sessions - создает новую сессию', async () => {
        const res = await app.request('/api/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${studentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ durationHours: 2 })
        })

        expect(res.status).toBe(201)
        const data = await res.json()
        expect(data.session.id).toBeDefined()
        expect(data.session.status).toBe('in_progress')
    })

    it('GET /api/admin/stats - студенту доступ запрещен (403)', async () => {
        const res = await app.request('/api/admin/stats', {
            headers: { Authorization: `Bearer ${studentToken}` }
        })
        expect(res.status).toBe(400) 
    })

    it('GET /api/admin/stats - админу доступ разрешен (200)', async () => {
        const res = await app.request('/api/admin/stats', {
            headers: { Authorization: `Bearer ${adminToken}` }
        })
        expect(res.status).toBe(200)
    })
})