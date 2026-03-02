"use client"

import type React from "react"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Target, Calendar, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Lead {
  id: string
  tipo: string
  score: number
  estado: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { data: leads = [], isLoading } = useSWR<Lead[]>("/api/leads", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const [chartData, setChartData] = useState<{ date: string; leads: number }[]>([])
  const [typeDistribution, setTypeDistribution] = useState<{ name: string; value: number }[]>([])
  const [stateDistribution, setStateDistribution] = useState<{ name: string; value: number }[]>([])
  const [propCount, setPropCount] = useState(0)

  useEffect(() => {
    supabase
      .from("propiedades")
      .select("id", { count: "exact", head: true })
      .eq("activa", true)
      .then(({ count }) => setPropCount(count ?? 0))
  }, [])

  useEffect(() => {
    if (!leads || leads.length === 0) return

    // Generate chart data for last 30 days
    const today = new Date()
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    const leadsByDay = last30Days.map((day) => ({
      date: new Date(day).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      leads: leads.filter((l) => l.createdAt.startsWith(day)).length,
    }))

    setChartData(leadsByDay)

    // Type distribution
    const typeCount = leads.reduce((acc: Record<string, number>, lead) => {
      acc[lead.tipo] = (acc[lead.tipo] || 0) + 1
      return acc
    }, {})

    setTypeDistribution(
      Object.entries(typeCount).map(([name, value]) => ({
        name,
        value,
      })),
    )

    // State distribution
    const stateCount = leads.reduce((acc: Record<string, number>, lead) => {
      acc[lead.estado] = (acc[lead.estado] || 0) + 1
      return acc
    }, {})

    setStateDistribution(
      Object.entries(stateCount).map(([name, value]) => ({
        name,
        value,
      })),
    )
  }, [leads])

  const totalLeads = leads.length
  const hotLeads = leads.filter((l) => l.score >= 70).length
  const conversionRate =
    leads.length > 0 ? ((leads.filter((l) => l.estado === "Cerrado").length / leads.length) * 100).toFixed(1) : "0"
  const todayLeads = leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Resumen de tu actividad inmobiliaria</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              icon={<Users className="w-8 h-8" />}
              title="Total de Leads"
              value={totalLeads}
              color="bg-blue-100 text-blue-800"
            />
            <KPICard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Leads Calientes"
              value={hotLeads}
              color="bg-green-100 text-green-800"
            />
            <KPICard
              icon={<Target className="w-8 h-8" />}
              title="Tasa de Conversión"
              value={`${conversionRate}%`}
              color="bg-orange-100 text-orange-800"
            />
            <KPICard
              icon={<Calendar className="w-8 h-8" />}
              title="Leads Hoy"
              value={todayLeads}
              color="bg-purple-100 text-purple-800"
            />
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link href="/admin/propiedades">
              <Card className="p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Gestionar Propiedades</p>
                      <p className="text-xs text-muted-foreground">{propCount} activas</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/propiedades">
              <Card className="p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Nueva Propiedad</p>
                      <p className="text-xs text-muted-foreground">Añadir al inventario</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/leads">
              <Card className="p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 rounded-xl">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Ver Leads</p>
                      <p className="text-xs text-muted-foreground">{totalLeads} en total</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Line Chart */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Leads por Día (últimos 30 días)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart - Type Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Distribución por Tipo</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* State Distribution Chart */}
          <Card className="mt-8 p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Leads por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  )
}

function KPICard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  color: string
}) {
  return (
    <Card className="p-6">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-muted-foreground text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </Card>
  )
}
