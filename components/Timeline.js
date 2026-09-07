import { useCallback, useEffect, useRef, useState } from 'react';

import { TIMELINE_EVENTS, mediaKind, mediaOf } from './timelineEvents.mjs';

/**
 * Timeline for the About page.
 *
 * Card order is media, date, caption. The date sits inside the card under
 * the picture rather than floating on the centre rail, so a card reads top
 * to bottom as one block.
 *
 * An event carries zero or more images/videos. With none it shows the
 * camera placeholder; with any, the first is the thumbnail and clicking it
 * opens a viewer for stepping through the rest.
 */
export default function Timeline({ events = TIMELINE_EVENTS }) {
  const [viewer, setViewer] = useState(null);
  const triggers = useRef(new Map());

  const open = useCallback((eventIndex) => setViewer({ eventIndex, itemIndex: 0 }), []);

  const close = useCallback(() => {
    setViewer((current) => {
      // Send focus back to the thumbnail that opened the viewer, so keyboard
      // users resume where they left off instead of at the top of the page.
      if (current !== null) triggers.current.get(current.eventIndex)?.focus();
      return null;
    });
  }, []);

  const step = useCallback(
    (delta) =>
      setViewer((current) => {
        if (current === null) return current;
        const total = mediaOf(events[current.eventIndex]).length;
        if (total === 0) return current;
        return { ...current, itemIndex: (current.itemIndex + delta + total) % total };
      }),
    [events],
  );

  const show = useCallback(
    (itemIndex) => setViewer((current) => (current === null ? current : { ...current, itemIndex })),
    [],
  );

  return (
    <>
      <div className="tl">
        {events.map((event, index) => (
          <TimelineRow
            key={`${event.date}-${index}`}
            event={event}
            onOpen={() => open(index)}
            registerTrigger={(node) => {
              if (node) triggers.current.set(index, node);
              else triggers.current.delete(index);
            }}
          />
        ))}
      </div>

      {viewer !== null && (
        <MediaViewer
          event={events[viewer.eventIndex]}
          index={viewer.itemIndex}
          onClose={close}
          onStep={step}
          onShow={show}
        />
      )}

      <style jsx global>{`
        /* timeline.css:start */
        .tl-subhead {
          text-align: center;
          margin: 2.5rem 0 0;
          color: #111;
          font-size: 1.4rem;
          font-weight: 700;
        }
        .tl {
          position: relative;
          max-width: 940px;
          margin: 1rem auto 0;
          padding: 1.5rem 0 1rem;
        }
        .tl::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 38px;
          transform: translateX(-50%);
          border: 4px solid #1c3f9c;
          border-radius: 19px;
          z-index: 0;
        }
        .tl-row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .tl-row + .tl-row {
          margin-top: 2.75rem;
        }
        .tl-combo {
          grid-column: 1;
          justify-self: end;
          margin-right: 24px;
          width: min(380px, 100%);
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          z-index: 1;
        }
        .tl-row:nth-child(even) .tl-combo {
          grid-column: 2;
          justify-self: start;
          margin-right: 0;
          margin-left: 24px;
        }
        .tl-media {
          align-self: flex-end;
          width: 200px;
          height: 200px;
          position: relative;
          padding: 0;
          border: 0;
          background: none;
          display: block;
        }
        .tl-pill {
          align-self: flex-end;
          white-space: nowrap;
          background: #2456c8;
          color: #fff;
          border-radius: 999px;
          padding: 0.42rem 1.15rem;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .tl-row:nth-child(even) .tl-media,
        .tl-row:nth-child(even) .tl-pill {
          align-self: flex-start;
        }
        .tl-media img,
        .tl-media video,
        .tl-media-ph {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 0 4px #cfe0f7;
        }
        button.tl-media {
          cursor: pointer;
          border-radius: 50%;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        button.tl-media:hover,
        button.tl-media:focus-visible {
          transform: scale(1.03);
        }
        button.tl-media:focus-visible {
          outline: 3px solid #1c3f9c;
          outline-offset: 4px;
        }
        .tl-media-badge {
          position: absolute;
          right: 6px;
          bottom: 6px;
          min-width: 30px;
          height: 30px;
          padding: 0 0.5rem;
          border-radius: 999px;
          background: #1c3f9c;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          box-shadow: 0 0 0 3px #fff;
        }
        .tl-media-play {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .tl-media-play span {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: rgba(28, 63, 156, 0.85);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          padding-left: 4px;
        }
        .tl-media-ph {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          background: #e8eff9;
          color: #7f9bc4;
        }
        .tl-media-icon {
          font-size: 2rem;
          line-height: 1;
        }
        .tl-media-note {
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .tl-caption p {
          margin: 0;
          color: #000;
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .tl-caption strong {
          color: #000;
          font-weight: 700;
        }

        .tl-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(6, 13, 30, 0.94);
        }
        .tl-modal-panel {
          position: relative;
          width: min(960px, 100%);
          max-height: 100%;
          /* Room for the close button, and a scrollbar rather than a clipped
             panel when a tall image meets a short window. */
          padding-top: 3.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .tl-modal-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }
        .tl-modal-stage img,
        .tl-modal-stage video {
          max-width: 100%;
          max-height: 60vh;
          border-radius: 8px;
          background: #000;
        }
        .tl-modal-meta {
          color: #e8eff9;
          text-align: center;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .tl-modal-meta strong {
          color: #fff;
          display: block;
          font-size: 1rem;
        }
        .tl-modal-count {
          display: block;
          margin-top: 0.35rem;
          color: #9db4dd;
          font-size: 0.8rem;
          letter-spacing: 0.04em;
        }
        .tl-modal button {
          border: 0;
          cursor: pointer;
          color: #fff;
          background: rgba(28, 63, 156, 0.9);
          border-radius: 999px;
        }
        .tl-modal button:focus-visible {
          outline: 3px solid #fff;
          outline-offset: 3px;
        }
        .tl-modal-close {
          position: absolute;
          top: 0;
          right: 0;
          width: 44px;
          height: 44px;
          font-size: 1.4rem;
          line-height: 1;
        }
        .tl-modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          font-size: 1.6rem;
          line-height: 1;
        }
        .tl-modal-prev {
          left: -0.5rem;
        }
        .tl-modal-next {
          right: -0.5rem;
        }
        .tl-modal-thumbs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tl-modal-thumbs button {
          width: 56px;
          height: 56px;
          padding: 0;
          border-radius: 6px;
          overflow: hidden;
          background: #0d1b3a;
          opacity: 0.55;
        }
        .tl-modal-thumbs button[aria-current='true'] {
          opacity: 1;
          box-shadow: 0 0 0 3px #7fa8f0;
        }
        .tl-modal-thumbs img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tl-modal-thumb-video {
          color: #cfe0f7;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .tl {
            max-width: 480px;
            padding: 1.75rem 0;
          }
          .tl::before {
            left: 14px;
            width: 28px;
            border-radius: 14px;
            transform: none;
          }
          .tl-row,
          .tl-row + .tl-row {
            grid-template-columns: 1fr;
            margin-top: 0;
            margin-bottom: 2.25rem;
            padding-left: 46px;
          }
          .tl-combo,
          .tl-row:nth-child(even) .tl-combo {
            grid-column: 1;
            justify-self: start;
            margin: 0;
            width: 100%;
          }
          .tl-media,
          .tl-row:nth-child(even) .tl-media,
          .tl-pill,
          .tl-row:nth-child(even) .tl-pill {
            align-self: flex-start;
          }
          .tl-media {
            width: 132px;
            height: 132px;
          }
          .tl-modal {
            padding: 1rem;
          }
          .tl-modal-nav {
            width: 40px;
            height: 40px;
          }
          .tl-modal-prev {
            left: 0;
          }
          .tl-modal-next {
            right: 0;
          }
        }
        /* timeline.css:end */
      `}</style>
    </>
  );
}

function TimelineRow({ event, onOpen, registerTrigger }) {
  const media = mediaOf(event);
  const label = event.title.replace(/\.$/, '');

  return (
    <div className="tl-row">
      <div className="tl-combo">
        {media.length === 0 ? (
          <div className="tl-media">
            <div aria-hidden="true" className="tl-media-ph">
              <span className="tl-media-icon">📷</span>
              <span className="tl-media-note">Photo</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="tl-media"
            ref={registerTrigger}
            onClick={onOpen}
            aria-label={
              media.length === 1
                ? `View the photo for ${label}`
                : `View all ${media.length} photos and videos for ${label}`
            }
          >
            <Thumbnail item={media[0]} alt={media[0].alt ?? label} />
            {mediaKind(media[0]) === 'video' && (
              <span className="tl-media-play" aria-hidden="true">
                <span>▶</span>
              </span>
            )}
            {media.length > 1 && (
              <span className="tl-media-badge" aria-hidden="true">
                +{media.length - 1}
              </span>
            )}
          </button>
        )}

        <span className="tl-pill">{event.date}</span>

        <div className="tl-caption">
          <p>
            <strong>{event.title}</strong> {event.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/** A still frame for the card: the poster for a video, the image itself otherwise. */
function Thumbnail({ item, alt }) {
  if (mediaKind(item) === 'video') {
    return item.poster ? (
      <img src={item.poster} alt={alt} />
    ) : (
      <video src={item.src} muted playsInline preload="metadata" aria-label={alt} />
    );
  }
  return <img src={item.src} alt={alt} />;
}

function MediaViewer({ event, index, onClose, onStep, onShow }) {
  const media = mediaOf(event);
  const item = media[index];
  const panel = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onStep(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onStep(1);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onStep]);

  // Stop the page behind the viewer from scrolling while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (item === undefined) return null;

  const label = event.title.replace(/\.$/, '');
  const many = media.length > 1;

  return (
    <div
      className="tl-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} — ${event.date}`}
      onMouseDown={(e) => {
        // Close on backdrop clicks only, not on drags that end outside.
        if (panel.current?.contains(e.target)) return;
        // Without this the browser's own mousedown handling moves focus to
        // <body> straight after we restore it, stranding keyboard users.
        e.preventDefault();
        onClose();
      }}
    >
      <div className="tl-modal-panel" ref={panel}>
        <button type="button" className="tl-modal-close" ref={closeButton} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="tl-modal-stage">
          {mediaKind(item) === 'video' ? (
            <video key={item.src} src={item.src} poster={item.poster} controls autoPlay playsInline />
          ) : (
            <img key={item.src} src={item.src} alt={item.alt ?? label} />
          )}

          {many && (
            <>
              <button type="button" className="tl-modal-nav tl-modal-prev" onClick={() => onStep(-1)} aria-label="Previous">
                ‹
              </button>
              <button type="button" className="tl-modal-nav tl-modal-next" onClick={() => onStep(1)} aria-label="Next">
                ›
              </button>
            </>
          )}
        </div>

        <p className="tl-modal-meta">
          <strong>{label}</strong>
          {event.date}
          {many && (
            <span className="tl-modal-count">
              {index + 1} of {media.length}
            </span>
          )}
        </p>

        {many && (
          <div className="tl-modal-thumbs">
            {media.map((entry, i) => (
              <button
                key={`${entry.src}-${i}`}
                type="button"
                aria-current={i === index}
                aria-label={`Show item ${i + 1}`}
                onClick={() => onShow(i)}
              >
                {mediaKind(entry) === 'video' && !entry.poster ? (
                  <span className="tl-modal-thumb-video" aria-hidden="true">
                    ▶
                  </span>
                ) : (
                  <img src={entry.poster ?? entry.src} alt="" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
