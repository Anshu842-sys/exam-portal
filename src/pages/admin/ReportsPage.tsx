import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  FileSpreadsheet,
  GraduationCap,
  Award,
  Layers,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { db } from '../../lib/databaseService';
import { Department, Exam, Mark, Result, Student, Subject } from '../../types/database';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type ReportType =
  | 'student_performance'
  | 'subject_performance'
  | 'department_performance'
  | 'pass_fail_analysis'
  | 'exam_schedule'
  | 'marks_status';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('student_performance');
  const [loading, setLoading] = useState(true);

  // Raw Database Data
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Report Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, f, sub, e, m, r, d] = await Promise.all([
        db.getStudents(),
        db.getFaculty(),
        db.getSubjects(),
        db.getExams(),
        db.getMarks(),
        db.getResults(),
        db.getDepartments()
      ]);
      setStudents(s);
      setFaculty(f);
      setSubjects(sub);
      setExams(e);
      setMarks(m);
      setResults(r);
      setDepartments(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // CSV Export Generator
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner label="Generating Academic Cell Analytics & Reports..." />;
  }

  // --- REPORT COMPUTATIONS ---

  // 1. Student Performance Report
  const studentRows = students
    .filter(s => {
      if (selectedDept !== 'all' && s.department_id !== selectedDept) return false;
      if (selectedSem !== 'all' && s.semester !== Number(selectedSem)) return false;
      return true;
    })
    .map(s => {
      const sMarks = marks.filter(m => m.student_id === s.id);
      const sResult = results.find(r => r.student_id === s.id);
      const avgScore =
        sMarks.length > 0
          ? Number((sMarks.reduce((acc, m) => acc + Number(m.total_marks), 0) / sMarks.length).toFixed(1))
          : 'N/A';
      return {
        rollNumber: s.roll_number,
        name: s.user?.full_name || 'N/A',
        department: s.department?.code || 'N/A',
        semester: `Sem ${s.semester}`,
        coursesEvaluated: sMarks.length,
        averageMarks: avgScore,
        sgpa: sResult ? sResult.sgpa : 'Pending',
        status: sResult ? sResult.result_status : 'Pending'
      };
    });

  // 2. Subject Performance Report
  const subjectRows = subjects
    .filter(sub => {
      if (selectedDept !== 'all' && sub.department_id !== selectedDept) return false;
      if (selectedSem !== 'all' && sub.semester !== Number(selectedSem)) return false;
      return true;
    })
    .map(sub => {
      const subMarks = marks.filter(m => {
        const ex = exams.find(e => e.id === m.exam_id);
        return ex?.subject_id === sub.id;
      });
      const passedCount = subMarks.filter(m => m.result_status === 'Pass').length;
      const totalEvaluated = subMarks.length;
      const passRate = totalEvaluated > 0 ? Number(((passedCount / totalEvaluated) * 100).toFixed(1)) : 100;
      const avgMarks =
        totalEvaluated > 0
          ? Number((subMarks.reduce((acc, m) => acc + Number(m.total_marks), 0) / totalEvaluated).toFixed(1))
          : 0;

      return {
        code: sub.subject_code,
        name: sub.subject_name,
        department: sub.department?.code || 'N/A',
        semester: `Sem ${sub.semester}`,
        credits: sub.credits,
        studentsCount: totalEvaluated,
        passPercentage: `${passRate}%`,
        averageMarks: avgMarks
      };
    });

  // 3. Department Performance Report
  const deptRows = departments.map(d => {
    const deptStudents = students.filter(s => s.department_id === d.id);
    const deptStudentIds = deptStudents.map(s => s.id);
    const deptMarks = marks.filter(m => deptStudentIds.includes(m.student_id));
    const passedMarks = deptMarks.filter(m => m.result_status === 'Pass').length;
    const passPercentage =
      deptMarks.length > 0 ? Number(((passedMarks / deptMarks.length) * 100).toFixed(1)) : 100;

    return {
      code: d.code,
      name: d.name,
      students: deptStudents.length,
      evaluatedMarks: deptMarks.length,
      passPercentage: `${passPercentage}%`
    };
  });

  // 4. Pass / Fail Analysis
  const passFailRows = [
    {
      metric: 'Total Course Evaluations Processed',
      value: marks.length
    },
    {
      metric: 'Passed Course Papers (>= 40 Marks)',
      value: marks.filter(m => m.result_status === 'Pass').length
    },
    {
      metric: 'Arrear / Backlog Papers (< 40 Marks)',
      value: marks.filter(m => m.result_status === 'Fail').length
    },
    {
      metric: 'Overall Institutional Clearance Rate',
      value: marks.length > 0 ? `${((marks.filter(m => m.result_status === 'Pass').length / marks.length) * 100).toFixed(1)}%` : '100%'
    },
    {
      metric: 'A+ Grades Awarded (>= 90%)',
      value: marks.filter(m => m.grade === 'A+').length
    },
    {
      metric: 'A Grades Awarded (80-89%)',
      value: marks.filter(m => m.grade === 'A').length
    }
  ];

  // 5. Exam Schedule Report
  const scheduleRows = exams
    .filter(e => {
      if (selectedDept !== 'all' && e.department_id !== selectedDept) return false;
      if (selectedSem !== 'all' && e.semester !== Number(selectedSem)) return false;
      return true;
    })
    .map(e => ({
      date: e.exam_date,
      time: `${e.start_time.slice(0, 5)} - ${e.end_time.slice(0, 5)}`,
      subjectCode: e.subject?.subject_code || 'N/A',
      subjectName: e.subject?.subject_name || 'N/A',
      department: e.department?.code || 'N/A',
      semester: `Sem ${e.semester}`,
      room: e.room?.room_number || 'TBA',
      type: e.exam_type,
      status: e.status
    }));

  // 6. Marks Review Pipeline Report
  const marksPipelineRows = [
    { stage: 'Draft (Faculty Workspace)', count: marks.filter(m => m.status === 'Draft').length },
    { stage: 'Submitted (Awaiting Exam Cell Verification)', count: marks.filter(m => m.status === 'Submitted').length },
    { stage: 'Verified (Ready for Result Publishing)', count: marks.filter(m => m.status === 'Verified').length },
    { stage: 'Published (Live to Student Portals)', count: marks.filter(m => m.status === 'Published').length }
  ];

  const handleExportCurrent = () => {
    if (activeReport === 'student_performance') {
      downloadCSV(
        'student_performance_report',
        ['Roll Number', 'Student Name', 'Department', 'Semester', 'Courses Evaluated', 'Average Marks', 'SGPA', 'Status'],
        studentRows.map(r => [r.rollNumber, r.name, r.department, r.semester, r.coursesEvaluated, r.averageMarks, r.sgpa, r.status])
      );
    } else if (activeReport === 'subject_performance') {
      downloadCSV(
        'subject_performance_report',
        ['Subject Code', 'Subject Name', 'Department', 'Semester', 'Credits', 'Students Evaluated', 'Pass Rate', 'Average Score'],
        subjectRows.map(r => [r.code, r.name, r.department, r.semester, r.credits, r.studentsCount, r.passPercentage, r.averageMarks])
      );
    } else if (activeReport === 'department_performance') {
      downloadCSV(
        'department_performance_report',
        ['Department Code', 'Department Name', 'Students Enrolled', 'Evaluated Marks', 'Pass Rate'],
        deptRows.map(r => [r.code, r.name, r.students, r.evaluatedMarks, r.passPercentage])
      );
    } else if (activeReport === 'exam_schedule') {
      downloadCSV(
        'exam_schedule_master_report',
        ['Exam Date', 'Time Window', 'Subject Code', 'Subject Name', 'Department', 'Semester', 'Hall / Venue', 'Exam Type', 'Status'],
        scheduleRows.map(r => [r.date, r.time, r.subjectCode, r.subjectName, r.department, r.semester, r.room, r.type, r.status])
      );
    } else if (activeReport === 'marks_status') {
      downloadCSV(
        'marks_verification_pipeline_report',
        ['Pipeline Stage', 'Total Marks Records'],
        marksPipelineRows.map(r => [r.stage, r.count])
      );
    } else {
      downloadCSV(
        'pass_fail_analysis_report',
        ['Performance Metric', 'Institutional Value'],
        passFailRows.map(r => [r.metric, r.value])
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header (Hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Institutional Reports & Analytics Engine
          </h2>
          <p className="text-xs text-slate-400">
            Generate and export university performance audits, clearance rosters, and timetable archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCurrent}
            className="text-cyan-400 border-cyan-800 hover:bg-cyan-950/40"
          >
            Export to CSV
          </Button>
          <Button variant="cyan" size="sm" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Tabs (Hidden on print) */}
      <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {[
          { id: 'student_performance', label: 'Student Performance', icon: GraduationCap },
          { id: 'subject_performance', label: 'Subject Performance', icon: Layers },
          { id: 'department_performance', label: 'Department Audit', icon: BarChart3 },
          { id: 'pass_fail_analysis', label: 'Pass / Fail Clearance', icon: Award },
          { id: 'exam_schedule', label: 'Exam Timetable', icon: Calendar },
          { id: 'marks_status', label: 'Marks Processing Stage', icon: CheckSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters (Hidden on print) */}
      <div className="print:hidden flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSem}
          onChange={e => setSelectedSem(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Official Printable Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-black">
          Apex Autonomous University — Examination Cell
        </h1>
        <p className="text-xs text-slate-600 font-mono">
          Official Controller of Examinations Record • Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Report Tables */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md print:border-none print:bg-white print:p-0">
        {activeReport === 'student_performance' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Student Academic Performance Ledger
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3">Evaluated Papers</th>
                  <th className="p-3">Avg Marks</th>
                  <th className="p-3">SGPA</th>
                  <th className="p-3">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {studentRows.map(row => (
                  <tr key={row.rollNumber}>
                    <td className="p-3 font-mono text-cyan-400 print:text-blue-800">{row.rollNumber}</td>
                    <td className="p-3 font-medium text-white print:text-black">{row.name}</td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3">{row.semester}</td>
                    <td className="p-3 font-mono">{row.coursesEvaluated}</td>
                    <td className="p-3 font-mono">{row.averageMarks}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 print:text-emerald-700">{row.sgpa}</td>
                    <td className="p-3">
                      <span className={`font-mono text-xs ${row.status === 'Pass' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'subject_performance' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Curriculum Subject Pass Rates & Averages
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3">Sem</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Evaluated</th>
                  <th className="p-3">Pass Rate</th>
                  <th className="p-3">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {subjectRows.map(row => (
                  <tr key={row.code}>
                    <td className="p-3 font-mono font-bold text-purple-400 print:text-purple-800">{row.code}</td>
                    <td className="p-3 font-medium text-white print:text-black">{row.name}</td>
                    <td className="p-3">{row.department}</td>
                    <td className="p-3">{row.semester}</td>
                    <td className="p-3 font-mono">{row.credits}</td>
                    <td className="p-3 font-mono">{row.studentsCount}</td>
                    <td className="p-3 font-mono text-emerald-400 print:text-emerald-700 font-semibold">{row.passPercentage}</td>
                    <td className="p-3 font-mono font-bold">{row.averageMarks} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'department_performance' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Department Academic Benchmarking Audit
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Dept Code</th>
                  <th className="p-3">Department Name</th>
                  <th className="p-3">Enrolled Students</th>
                  <th className="p-3">Evaluations Processed</th>
                  <th className="p-3">Institutional Clearance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {deptRows.map(row => (
                  <tr key={row.code}>
                    <td className="p-3 font-mono font-bold text-cyan-400 print:text-blue-800">{row.code}</td>
                    <td className="p-3 font-medium text-white print:text-black">{row.name}</td>
                    <td className="p-3 font-mono">{row.students}</td>
                    <td className="p-3 font-mono">{row.evaluatedMarks}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 print:text-emerald-700">{row.passPercentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'pass_fail_analysis' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Institutional Pass / Fail & Clearance Metrics
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Academic Performance Metric</th>
                  <th className="p-3 text-right">Count / Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {passFailRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-200 print:text-black">{row.metric}</td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-400 print:text-blue-800">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'exam_schedule' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Master Examination Schedule & Hall Allocation
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Dept & Sem</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {scheduleRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono text-cyan-400 print:text-blue-800">{row.date}</td>
                    <td className="p-3 font-mono">{row.time}</td>
                    <td className="p-3 font-mono font-bold text-white print:text-black">{row.subjectCode}</td>
                    <td className="p-3">{row.subjectName}</td>
                    <td className="p-3">{row.department} • {row.semester}</td>
                    <td className="p-3 font-mono">{row.room}</td>
                    <td className="p-3 font-mono">{row.type}</td>
                    <td className="p-3">
                      <Badge variant="cyan" size="sm">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'marks_status' && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3 print:text-black">
              Evaluation & Marks Verification Pipeline Summary
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase print:bg-slate-100 print:text-slate-800">
                  <th className="p-3">Verification Pipeline Stage</th>
                  <th className="p-3 text-right">Paper Records In Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:text-slate-900 print:divide-slate-300">
                {marksPipelineRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-200 print:text-black">{row.stage}</td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-400 print:text-blue-800">{row.count} Records</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
