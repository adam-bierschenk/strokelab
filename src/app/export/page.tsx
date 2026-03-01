'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { exportRoundsToCSV, getRoundsForPDF, getStatsForExport } from '@/app/actions/export'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function ExportPage() {
  const [loadingCSV, setLoadingCSV] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [roundCount, setRoundCount] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { stats, error } = await getStatsForExport()
    if (stats) {
      setStats(stats)
      setRoundCount(stats.totalRounds)
    }
  }

  const handleExportCSV = async () => {
    setLoadingCSV(true)
    setError(null)

    const { data, error } = await exportRoundsToCSV()

    if (error) {
      setError(error)
    } else if (data) {
      // Download CSV
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `strokelab-rounds-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }

    setLoadingCSV(false)
  }

  const handleExportPDF = async () => {
    setLoadingPDF(true)
    setError(null)

    const { rounds, error } = await getRoundsForPDF()

    if (error) {
      setError(error)
      setLoadingPDF(false)
      return
    }

    if (!rounds || rounds.length === 0) {
      setError('No rounds to export')
      setLoadingPDF(false)
      return
    }

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Title
    doc.setFontSize(24)
    doc.setTextColor(16, 185, 129) // Green color
    doc.text('StrokeLab Golf Report', pageWidth / 2, 20, { align: 'center' })

    // Generated date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, 30, { align: 'center' })

    // Summary stats
    if (stats) {
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Summary', 14, 45)

      const statsData = [
        ['Total Rounds', stats.totalRounds.toString()],
        ['Average Score', stats.avgScore.toFixed(1)],
        ['Best Score', stats.bestScore.toString()],
        ['Average Putts', stats.avgPutts.toFixed(1)]
      ]

      ;(doc as any).autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 14, right: 14 }
      })
    }

    // Rounds table
    doc.setFontSize(14)
    doc.text('Rounds History', 14, (doc as any).lastAutoTable.finalY + 15)

    const tableData = rounds.map((round: any) => [
      new Date(round.date).toLocaleDateString('en-US'),
      round.course?.[0]?.name || 'Unknown',
      round.totalScore.toString(),
      round.totalPutts?.toString() || '-',
      round.fairwaysHit?.toString() || '-',
      round.greensInReg?.toString() || '-'
    ])

    ;(doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Course', 'Score', 'Putts', 'Fairways', 'GIR']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${pageCount} | StrokeLab Golf Statistics`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    doc.save(`strokelab-report-${new Date().toISOString().split('T')[0]}.pdf`)
    setLoadingPDF(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.totalRounds}</p>
                <p className="text-sm text-gray-600">Rounds</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.avgScore}</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.bestScore}</p>
                <p className="text-sm text-gray-600">Best Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.avgPutts}</p>
                <p className="text-sm text-gray-600">Avg Putts</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>

          <div className="space-y-4">
            {/* CSV Export */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">CSV Export</h3>
                  <p className="text-sm text-gray-500">Download raw data for spreadsheets</p>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={loadingCSV || roundCount === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loadingCSV ? 'Exporting...' : 'Download CSV'}
              </button>
            </div>

            {/* PDF Export */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">PDF Report</h3>
                  <p className="text-sm text-gray-500">Formatted report with charts and tables</p>
                </div>
              </div>
              <button
                onClick={handleExportPDF}
                disabled={loadingPDF || roundCount === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loadingPDF ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>

          {roundCount === 0 && (
            <p className="mt-4 text-center text-gray-500">
              No rounds to export. Log some rounds first!
            </p>
          )}
        </div>

        {/* CSV Format Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">CSV Format</h3>
          <p className="text-sm text-blue-700">
            Exports include: Date, Course, Score, Putts, Fairways Hit, Greens in Regulation, and Notes.
            Compatible with Excel, Google Sheets, and other spreadsheet apps.
          </p>
        </div>
      </main>
    </div>
  )
}
