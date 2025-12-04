import React from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import './explore.css';

/**
 * PUBLIC_INTERFACE
 * DestinationCard displays destination details with CTAs.
 */
export default function DestinationCard({ destination, onAddToTrip, onViewDetails }) {
  const { name, imageUrl, region, bestSeason, avgBudget } = destination || {};
  return (
    <Card className="explore-card" role="article" aria-label={`Destination ${name || ''}`}>
      <div className="explore-card-media" aria-hidden={imageUrl ? 'false' : 'true'}>
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'Destination image'} className="explore-card-img" />
        ) : (
          <div className="explore-card-placeholder" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" role="img" aria-label="Destination">
              <path fill="#2563EB" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="explore-card-body">
        <h3 className="explore-card-title">{name}</h3>
        <p className="explore-card-meta">
          {region ? <span>{region}</span> : null}
          {bestSeason ? <span> • Best in {bestSeason}</span> : null}
          {avgBudget ? <span> • Budget: {avgBudget}</span> : null}
        </p>
        <div className="explore-card-actions">
          <Button aria-label={`Add ${name} to trip`} onClick={() => onAddToTrip(destination)} variant="primary">Add to Trip</Button>
          <Button aria-label={`View details for ${name}`} onClick={() => onViewDetails(destination)} variant="secondary">View Details</Button>
        </div>
      </div>
    </Card>
  );
}
