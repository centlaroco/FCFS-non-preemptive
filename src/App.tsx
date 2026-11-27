import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

interface ProcessInput {
  id: string;
  arrivalTime: number;
  burstTime: number;
}

const processColors = ['#7068f5', '#16a995', '#f29b55', '#e86d91', '#4b9ee8'];

export default function App() {
  const [processes, setProcesses] = useState<ProcessInput[]>([]);
  const [newArrival, setNewArrival] = useState('');
  const [newBurst, setNewBurst] = useState('');

  const nextId = useMemo(() => {
    let number = 1;
    while (processes.some((process) => process.id === `P${number}`)) number++;
    return `P${number}`;
  }, [processes]);

  const results = useMemo(() => {
    const jobs = processes
      .map((process, index) => ({ process, index }))
      .sort(
        (a, b) =>
          a.process.arrivalTime - b.process.arrivalTime || a.index - b.index,
      );
    let currentTime = 0;

    return jobs.map(({ process }) => {
      const startTime = Math.max(currentTime, process.arrivalTime);
      const completionTime = startTime + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;
      currentTime = completionTime;

      return {
        ...process,
        startTime,
        completionTime,
        turnaroundTime,
        waitingTime,
      };
    });
  }, [processes]);

  const average = (key: 'turnaroundTime' | 'waitingTime') =>
    results.length
      ? (
          results.reduce((total, process) => total + process[key], 0) /
          results.length
        ).toFixed(2)
      : '0.00';

  const averageTAT = average('turnaroundTime');
  const averageWT = average('waitingTime');
  const busyTime = results.reduce(
    (total, process) => total + process.burstTime,
    0,
  );
  const finishTime = results.at(-1)?.completionTime ?? 0;
  const cpuUtilization = finishTime
    ? Math.round((busyTime / finishTime) * 100)
    : 0;

  const handleAddProcess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const arrival = Number(newArrival);
    const burst = Number(newBurst);

    if (
      newArrival.trim() === '' ||
      newBurst.trim() === '' ||
      !Number.isInteger(arrival) ||
      !Number.isInteger(burst) ||
      arrival < 0 ||
      burst <= 0
    ) {
      return;
    }

    setProcesses((previous) => {
      let number = 1;
      while (previous.some((process) => process.id === `P${number}`)) number++;
      return [
        ...previous,
        { id: `P${number}`, arrivalTime: arrival, burstTime: burst },
      ];
    });
    setNewArrival('');
    setNewBurst('');
  };

  const handleClear = () => {
    setProcesses([]);
    setNewArrival('');
    setNewBurst('');
  };

  return (
    <main className="min-h-screen bg-[#f5f6fb] px-3 pb-10 text-[#20233a] sm:px-4 md:px-7">
      <div className="mx-auto max-w-6xl">
        <section className="relative my-4 flex min-h-[205px] items-center justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-[#24243f] via-[#302d58] to-[#413b76] px-[22px] py-[27px] text-white shadow-[0_14px_30px_rgba(42,40,78,0.12)] sm:my-6 sm:min-h-[240px] sm:px-[46px] sm:py-[34px]">
          <div className="relative z-10">
            <p className="mb-2.5 text-[9px] font-extrabold tracking-[1.55px] text-[#aaa7df]">
              FCFS | OPERATING SYSTEM SCHEDULING ALGORITHM
            </p>
            <h1 className="m-0 text-[32px] font-bold leading-[1.12] tracking-[-1.9px] sm:text-[clamp(30px,4vw,43px)]">
              First in line.
              <br />
              <span className="text-[#aaa5ff]">First to execute.</span>
            </h1>
          </div>
          <div className="pointer-events-none absolute -right-[92px] -bottom-[45px] h-[175px] w-[220px] scale-[0.88] opacity-40 sm:relative sm:right-auto sm:bottom-auto sm:mr-[35px] sm:block sm:scale-100 sm:opacity-100">
            <div className="absolute inset-[14px_19px] rotate-[-24deg] rounded-[50%] border border-[rgba(185,179,255,0.24)]" />
            <div className="absolute inset-[26px_4px] rotate-[38deg] rounded-[50%] border border-[rgba(185,179,255,0.14)]" />
            <div className="absolute top-[61px] left-[75px] grid h-[50px] w-[70px] place-items-center rounded-[15px] border border-white/20 bg-white/10 text-xs font-extrabold tracking-[1px] text-[#e4e1ff] shadow-[0_8px_26px_rgba(13,12,42,0.2)] backdrop-blur">
              FCFS
            </div>
            <span className="absolute top-[15px] left-[50px] grid size-[34px] place-items-center rounded-[11px] border-[3px] border-[#35325c] bg-[#837afd] text-[9px] font-extrabold">
              P1
            </span>
            <span className="absolute top-[106px] right-[19px] grid size-[34px] place-items-center rounded-[11px] border-[3px] border-[#35325c] bg-[#20b89f] text-[9px] font-extrabold">
              P2
            </span>
            <span className="absolute bottom-px left-[47px] grid size-[34px] place-items-center rounded-[11px] border-[3px] border-[#35325c] bg-[#f09a5a] text-[9px] font-extrabold">
              P3
            </span>
          </div>
        </section>

        <section
          className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-[15px]"
          aria-label="Scheduling metrics"
        >
          <article className="min-h-[105px] rounded-[15px] border border-[#e5e2ff] bg-gradient-to-br from-white to-[#f8f7ff] p-[14px_17px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:min-h-[130px] sm:p-[19px_21px_16px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#818398]">
              <span>Average turnaround</span>
            </div>
            <div className="mt-[7px] text-[26px] font-bold leading-[1.1] tracking-[-1px] text-[#292a45] sm:text-[29px]">
              {averageTAT}<small className="text-[11px] font-medium tracking-normal text-[#9798aa]"> units</small>
            </div>
            <p className="mt-[5px] text-[10px] text-[#a0a1b0]">Completion time minus arrival time</p>
          </article>
          <article className="min-h-[105px] rounded-[15px] border border-[#e9eaf2] bg-white p-[14px_17px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:min-h-[130px] sm:p-[19px_21px_16px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#818398]">
              <span>Average waiting</span>
            </div>
            <div className="mt-[7px] text-[26px] font-bold leading-[1.1] tracking-[-1px] text-[#292a45] sm:text-[29px]">
              {averageWT}<small className="text-[11px] font-medium tracking-normal text-[#9798aa]"> units</small>
            </div>
            <p className="mt-[5px] text-[10px] text-[#a0a1b0]">Time spent waiting in the queue</p>
          </article>
        </section>

        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1.06fr_0.94fr]">
          <article className="rounded-[15px] border border-[#e9eaf2] bg-white p-[18px_16px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:p-[21px_23px]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="mb-1.5 text-[8px] font-extrabold tracking-[1.2px] text-[#9293ad]">BUILD YOUR QUEUE</p>
                <h2 className="m-0 text-[17px] font-bold tracking-[-0.45px] text-[#292a45]">Add a process</h2>
              </div>
              <span className="grid size-[27px] place-items-center rounded-lg bg-[#f1f0ff] text-[9px] font-extrabold text-[#7169f4]">01</span>
            </div>
            <form onSubmit={handleAddProcess}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[0.7fr_1fr_1fr]">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-[7px] block text-[10px] font-bold text-[#77798e]" htmlFor="process-id">Process ID</label>
                  <input id="process-id" value={nextId} readOnly className="h-[39px] w-full rounded-lg border border-[#e7e8ef] bg-[#f2f1ff] px-[11px] text-center text-xs font-bold text-[#7068f5] outline-none" />
                </div>
                <div>
                  <label className="mb-[7px] block text-[10px] font-bold text-[#77798e]" htmlFor="arrival-time">Arrival time</label>
                  <input
                    id="arrival-time"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newArrival}
                    onChange={(event) => setNewArrival(event.target.value)}
                    placeholder="e.g. 0"
                    className="h-[39px] w-full rounded-lg border border-[#e7e8ef] bg-[#fbfbfd] px-[11px] text-xs text-[#30314a] outline-none transition focus:border-[#8c85ff] focus:ring-[3px] focus:ring-[#7068f51c]"
                  />
                </div>
                <div>
                  <label className="mb-[7px] block text-[10px] font-bold text-[#77798e]" htmlFor="burst-time">Burst time</label>
                  <input
                    id="burst-time"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={newBurst}
                    onChange={(event) => setNewBurst(event.target.value)}
                    placeholder="e.g. 5"
                    className="h-[39px] w-full rounded-lg border border-[#e7e8ef] bg-[#fbfbfd] px-[11px] text-xs text-[#30314a] outline-none transition focus:border-[#8c85ff] focus:ring-[3px] focus:ring-[#7068f51c]"
                  />
                </div>
              </div>
              <div className="mt-[15px] flex gap-[9px]">
                <button className="h-[38px] rounded-lg bg-[#7068f5] px-4 text-[11px] font-bold text-white shadow-[0_5px_12px_rgba(112,104,245,0.2)] transition hover:-translate-y-px hover:bg-[#5e56e5]" type="submit">
                  <span className="mr-1 text-base">+</span> Add to queue
                </button>
                <button className="h-[38px] rounded-lg bg-[#f7f7fa] px-3 text-[11px] font-bold text-[#7f8091] transition hover:-translate-y-px hover:bg-[#f0eff5]" type="button" onClick={handleClear}>
                  Clear all
                </button>
              </div>
            </form>
            <p className="mt-[15px] flex items-center gap-[7px] text-[9px] text-[#a0a1b0]">
              <span className="grid size-[14px] place-items-center rounded-full border border-[#c4c5d0]">i</span>
              Arrival must be 0 or greater; burst time must be at least 1.
            </p>
          </article>

          <article className="rounded-[15px] border border-[#e9eaf2] bg-white p-[18px_16px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:p-[21px_23px]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="mb-1.5 text-[8px] font-extrabold tracking-[1.2px] text-[#9293ad]">CURRENT WORKLOAD</p>
                <h2 className="m-0 flex items-center gap-[9px] text-[17px] font-bold tracking-[-0.45px] text-[#292a45]">
                  Process queue
                  <span className="grid min-w-[21px] h-[21px] place-items-center rounded-[7px] bg-[#f1f0ff] px-[5px] text-[10px] text-[#7068f5]">{processes.length}</span>
                </h2>
              </div>
              <span className="pt-[5px] text-[9px] text-[#a0a1b0]">Arrival order</span>
            </div>
            {results.length === 0 ? (
              <div className="grid min-h-[132px] place-content-center justify-items-center text-center text-[#a4a5b3]">
                <span className="text-2xl text-[#a29cff]">◌</span>
                <p className="my-[7px] text-[11px] font-bold text-[#686a80]">Your queue is empty</p>
                <small className="text-[9px]">Add a process to start the simulation.</small>
              </div>
            ) : (
              <div className="grid gap-[7px]">
                {results.map((process, index) => (
                  <div className="flex min-h-12 items-center gap-2.5 rounded-[9px] border border-[#f0f0f5] px-[9px] py-1.5 transition hover:border-[#e6e4ff] hover:bg-[#fbfaff]" key={process.id}>
                    <span
                      className="grid size-[30px] shrink-0 place-items-center rounded-[9px] text-[9px] font-extrabold text-white"
                      style={{ backgroundColor: processColors[index % processColors.length] }}
                    >
                      {process.id}
                    </span>
                    <div className="grid flex-1 gap-[3px]">
                      <strong className="text-[10px] text-[#3a3b54]">{process.id}</strong>
                      <span className="text-[9px] text-[#a0a1b0]">Arrives at {process.arrivalTime}</span>
                    </div>
                    <div className="grid min-w-[43px] gap-[3px] text-right">
                      <strong className="text-[10px] text-[#3a3b54]">{process.burstTime}</strong>
                      <span className="text-[9px] text-[#a0a1b0]">burst</span>
                    </div>
                    <button
                      className="grid size-[25px] place-items-center rounded-[7px] bg-transparent text-[19px] leading-none text-[#b5b6c2] hover:bg-[#fff0f1] hover:text-[#d76575]"
                      type="button"
                      onClick={() =>
                        setProcesses((previous) =>
                          previous.filter((item) => item.id !== process.id),
                        )
                      }
                      aria-label={`Remove ${process.id}`}
                      title={`Remove ${process.id}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="mb-4 rounded-[15px] border border-[#e9eaf2] bg-white p-[18px_16px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:p-[21px_23px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mb-1.5 text-[8px] font-extrabold tracking-[1.2px] text-[#9293ad]">EXECUTION VISUALIZATION</p>
              <h2 className="m-0 text-[17px] font-bold tracking-[-0.45px] text-[#292a45]">CPU timeline</h2>
            </div>
            <div className="flex gap-2 text-[9px] text-[#9293a4] sm:gap-[14px]">
              <span className="inline-flex items-center gap-[5px]"><i className="size-[7px] rounded-[3px] bg-[#7068f5]" />Process</span>
              <span className="inline-flex items-center gap-[5px]"><i className="size-[7px] rounded-[3px] border border-dashed border-[#a9aab8] bg-[#f1f1f5]" />Idle</span>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="grid min-h-[90px] place-items-center text-[11px] text-[#a0a1b0]">Add a process to see the execution timeline.</div>
          ) : (
            <div className="overflow-x-auto px-px pt-1">
              <div className="flex min-w-max items-stretch gap-[5px]">
                {results.map((process, index) => {
                  const previousEnd =
                    index === 0 ? 0 : results[index - 1].completionTime;
                  const idleTime = process.startTime - previousEnd;
                  return (
                    <React.Fragment key={process.id}>
                      {idleTime > 0 && (
                        <div
                          className="flex min-h-[67px] shrink-0 flex-col items-center justify-center gap-[5px] rounded-[10px] border border-dashed border-[#d1d2dd] bg-[#f7f7fa] text-[#9293a4]"
                          style={{ width: Math.max(82, idleTime * 54) }}
                        >
                          <span className="text-[11px] font-extrabold">IDLE</span>
                          <small className="text-[9px] opacity-80">{previousEnd}–{process.startTime}</small>
                        </div>
                      )}
                      <div
                        className="flex min-h-[67px] shrink-0 flex-col items-center justify-center gap-[5px] rounded-[10px] text-white shadow-md"
                        style={{
                          width: Math.max(92, process.burstTime * 54),
                          backgroundColor: processColors[index % processColors.length],
                        }}
                      >
                        <span className="text-[11px] font-extrabold">{process.id}</span>
                        <small className="text-[9px] opacity-80">{process.startTime}–{process.completionTime}</small>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-[9px] flex justify-between text-[9px] text-[#a0a1b0]">
                <span>0</span>
                <span>{finishTime} time units</span>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-[15px] border border-[#e9eaf2] bg-white px-4 pt-[18px] shadow-[0_5px_18px_rgba(43,45,80,0.035)] sm:px-[23px] sm:pt-[21px]">
          <div className="mb-[15px] flex items-start justify-between">
            <div>
              <p className="mb-1.5 text-[8px] font-extrabold tracking-[1.2px] text-[#9293ad]">SCHEDULING BREAKDOWN</p>
              <h2 className="m-0 text-[17px] font-bold tracking-[-0.45px] text-[#292a45]">Process details</h2>
            </div>
            <span className="pt-[5px] text-[9px] text-[#a0a1b0]">All times in units</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="border-y border-[#f0f0f5] bg-[#fbfbfd] text-[8px] font-bold uppercase tracking-[0.55px] text-[#9697a8]">
                  <th className="px-3 py-2.5">Process</th>
                  <th className="px-3 py-2.5">Arrival</th>
                  <th className="px-3 py-2.5">Burst</th>
                  <th className="px-3 py-2.5">Starts</th>
                  <th className="px-3 py-2.5">Completes</th>
                  <th className="px-3 py-2.5">Turnaround</th>
                  <th className="px-3 py-2.5">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {results.length ? (
                  results.map((process, index) => (
                    <tr className="h-[45px] border-b border-[#f1f1f5] text-[10px] text-[#737589]" key={process.id}>
                      <td className="px-3 py-2 text-[#3d3e56]">
                        <span
                          className="mr-2 inline-block size-[7px] rounded-[3px] align-[1px]"
                          style={{ backgroundColor: processColors[index % processColors.length] }}
                        />
                        <strong>{process.id}</strong>
                      </td>
                      <td className="px-3 py-2">{process.arrivalTime}</td>
                      <td className="px-3 py-2">{process.burstTime}</td>
                      <td className="px-3 py-2">{process.startTime}</td>
                      <td className="px-3 py-2">{process.completionTime}</td>
                      <td className="px-3 py-2 font-bold text-[#625bea]">{process.turnaroundTime}</td>
                      <td className="px-3 py-2 font-bold text-[#625bea]">{process.waitingTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="h-[76px] text-center text-[10px] text-[#a0a1b0]" colSpan={7}>
                      No processes to display yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-x-[18px] gap-y-2 py-[13px] text-[9px] text-[#9697a8]">
            <span><strong className="text-[#6d6e83]">CT</strong> = Start + Burst</span>
            <span><strong className="text-[#6d6e83]">TAT</strong> = CT − Arrival</span>
            <span><strong className="text-[#6d6e83]">WT</strong> = TAT − Burst</span>
          </div>
        </section>

        <footer className="flex justify-between gap-2 px-1 pt-[18px] text-[8px] text-[#a2a3b1] sm:text-[9px]">
          <span> FCFS visualizer</span>
          <span>Non-preemptive scheduling</span>
        </footer>
      </div>
    </main>
  );
}
