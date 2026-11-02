import React, { useState, useMemo } from 'react';
import type { FormEvent } from 'react';

interface ProcessInput {
  id: string;
  arrivalTime: number;
  burstTime: number;
}

interface ScheduledProcess extends ProcessInput {
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export default function FCFSScheduler() {
  const [processes, setProcesses] = useState<ProcessInput[]>([
    { id: 'P1', arrivalTime: 0, burstTime: 7 },
    { id: 'P2', arrivalTime: 2, burstTime: 4 },
    { id: 'P3', arrivalTime: 4, burstTime: 1 },
    { id: 'P4', arrivalTime: 5, burstTime: 4 },
  ]);

  const [newArrival, setNewArrival] = useState('');
  const [newBurst, setNewBurst] = useState('');

  // Generate the next unused process ID.
  const nextId = useMemo(() => {
    let n = 1;
    while (processes.some((p) => p.id === `P${n}`)) n++;
    return `P${n}`;
  }, [processes]);

  // Non-preemptive First Come, First Served scheduling.
  const results = useMemo(() => {
    const completed: ScheduledProcess[] = [];
    const jobs = processes
      .map((process, index) => ({ process, index }))
      .sort((a, b) => a.process.arrivalTime - b.process.arrivalTime || a.index - b.index);
    let currentTime = 0;

    for(let i = 0; i < jobs.length; i++) {
      const { process } = jobs[i];
      const startTime = Math.max(currentTime, process.arrivalTime);
      const completionTime = startTime + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;

      completed.push({
        ...process,
        startTime,
        completionTime,
        turnaroundTime,
        waitingTime,
      });

      currentTime = completionTime;
    }

    return completed;
  }, [processes]);

  const avgTAT = results.length
    ? (
        results.reduce((sum, p) => sum + p.turnaroundTime, 0) /
        results.length
      ).toFixed(2)
    : '0.00';

  const avgWT = results.length
    ? (
        results.reduce((sum, p) => sum + p.waitingTime, 0) /
        results.length
      ).toFixed(2)
    : '0.00';

  const handleAddProcess = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const arrival = Number(newArrival);
    const burst = Number(newBurst);

    if (
      newArrival.trim() === '' ||
      newBurst.trim() === '' ||
      !Number.isInteger(arrival) ||
      !Number.isInteger(burst) || arrival < 0 || burst <= 0
    ) {
      return;
    }

    setProcesses((prev) => [
      ...prev,
      {
        id: (() => {
          let n = 1;
          while (prev.some((p) => p.id === `P${n}`)) n++;
          return `P${n}`;
        })(),
        arrivalTime: arrival,
        burstTime: burst,
      },
    ]);

    setNewArrival('');
    setNewBurst('');
  };

  const handleClear = () => {
    setProcesses([]);
    setNewArrival('');
    setNewBurst('');
  };

  const colors = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-teal-600',
    'bg-cyan-700',
  ];

  const scale = 45;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 font-sans text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl  font-bold  tracking-tight sm:text-3xl">
            First Come, First Served (FCFS) Visualizer
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Interactive CPU scheduling simulator using
            non-preemptive FCFS.
          </p>
        </header>

        {/* Controls and metrics */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Add System Process</h2>

            <form
              onSubmit={handleAddProcess}
              className="grid grid-cols-1 items-end gap-4 sm:grid-cols-4"
            >
              <div>
                <label htmlFor="process-id" className="mb-1 block text-xs font-medium uppercase text-gray-500">
                  Process ID
                </label>
                <input
                  id="process-id"
                  value={nextId}
                  readOnly
                  className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-center font-semibold"
                />
              </div>

              <div>
                <label htmlFor="arrival-time" className="mb-1 block text-xs font-medium uppercase text-gray-500">
                  Arrival Time
                </label>
                <input
                  id="arrival-time"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={newArrival}
                  onChange={(e) => setNewArrival(e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="burst-time" className="mb-1 block text-xs font-medium uppercase text-gray-500">
                  Burst Time
                </label>
                <input
                  id="burst-time"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={newBurst}
                  onChange={(e) => setNewBurst(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Insert
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Metrics */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Performance Metrics
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-sm text-gray-500">
                  Avg Turnaround Time
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {avgTAT}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Avg Waiting Time
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  {avgWT}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Time units match your input values.
            </p>
          </div>
        </section>

        {/* Gantt chart */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Gantt Chart Timeline
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            {results.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Add a process to populate the execution timeline.
              </p>
            ) : (
              <div className="min-w-max">
                <div className="flex items-stretch gap-1">
                  {results.map((p, index) => {
                    const previousEnd =
                      index === 0
                        ? 0
                        : results[index - 1].completionTime;

                    const idleTime = p.startTime - previousEnd;

                    return (
                      <React.Fragment key={p.id}>
                        {idleTime > 0 && (
                          <div
                            style={{
                              width: Math.max(50, idleTime * scale),
                            }}
                            className="flex shrink-0 flex-col items-center justify-center rounded border border-dashed border-gray-400 bg-gray-200 px-2 py-4 text-gray-600"
                          >
                            <span className="text-xs font-bold">
                              IDLE
                            </span>
                            <span className="mt-1 text-xs">
                              {previousEnd}–{p.startTime}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            width: Math.max(65, p.burstTime * scale),
                          }}
                          className={`flex shrink-0 flex-col items-center justify-center rounded border border-white/20 px-2 py-4 text-white shadow-sm ${
                            colors[index % colors.length]
                          }`}
                        >
                          <span className="font-bold">{p.id}</span>
                          <span className="mt-1 text-xs">
                            {p.startTime}–{p.completionTime}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-between text-xs font-medium text-gray-500">
                  <span>Start: 0</span>
                  <span>
                    Finish: {results[results.length - 1].completionTime}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Process table */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold">
              Process Management Data Grid
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Processes are displayed in execution order.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Process</th>
                  <th className="px-5 py-3">Arrival</th>
                  <th className="px-5 py-3">Burst</th>
                  <th className="px-5 py-3">Start</th>
                  <th className="px-5 py-3">Completion</th>
                  <th className="px-5 py-3">Turnaround</th>
                  <th className="px-5 py-3">Waiting</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {results.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold">{p.id}</td>
                    <td className="px-5 py-4">{p.arrivalTime}</td>
                    <td className="px-5 py-4">{p.burstTime}</td>
                    <td className="px-5 py-4">{p.startTime}</td>
                    <td className="px-5 py-4">{p.completionTime}</td>
                    <td className="px-5 py-4 font-medium text-blue-600">
                      {p.turnaroundTime}
                    </td>
                    <td className="px-5 py-4 font-medium text-indigo-600">
                      {p.waitingTime}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setProcesses((prev) =>
                            prev.filter((item) => item.id !== p.id)
                          )
                        }
                        aria-label={`Remove ${p.id}`}
                        className="rounded-md px-3 py-1 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No processes available. Insert a process to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Formula reference */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">
            Scheduling Formulas
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong>Completion Time (CT)</strong> = Start Time + Burst Time
            </li>
            <li>
              <strong>Turnaround Time (TAT)</strong> = CT − Arrival Time
            </li>
            <li>
              <strong>Waiting Time (WT)</strong> = TAT − Burst Time
            </li>
            <li>
              <strong>Average TAT</strong> = Total TAT ÷ Number of Processes
            </li>
            <li>
              <strong>Average WT</strong> = Total WT ÷ Number of Processes
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}