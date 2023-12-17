using System.Timers;
using Timer = System.Timers.Timer;

namespace Spillgebees.Blazor.RichTextEditor;

public class Delayer : IDisposable
{
        private readonly Timer _delayTimer;

        public event EventHandler? DelayElapsed;

        public Delayer(double interval)
        {
            _delayTimer = new Timer(interval);
            _delayTimer.Elapsed += OnElapsed;
            _delayTimer.AutoReset = false;
        }

        public void ResetDelay()
        {
            _delayTimer.Stop();
            _delayTimer.Start();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void OnElapsed(object? source, ElapsedEventArgs args)
            => DelayElapsed?.Invoke(source, args);

        private void Dispose(bool disposing)
        {
            if (!disposing)
            {
                return;
            }

            _delayTimer.Dispose();
        }
}

