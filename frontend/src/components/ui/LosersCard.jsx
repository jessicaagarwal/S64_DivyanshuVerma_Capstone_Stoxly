import React from "react";
import { CardBody, CardContainer, CardItem } from "./3d-card";
import "./LosersCard.css";
import Loader from "../loader";

export default function LosersCard({ losers, loading, error }) {
  return (
    <CardContainer 
      className="losers-card-container"
      containerClassName="losers-card-outer"
    >
      <CardBody className="losers-card-body">
        <CardItem
          translateZ="50"
          className="losers-card-title"
        >
          Top Losers
        </CardItem>
        
        {loading ? (
          <CardItem translateZ="60" className="losers-card-loading">
            <Loader />
          </CardItem>
        ) : error ? (
          <CardItem translateZ="60" className="losers-card-error">
            {error}
          </CardItem>
        ) : losers?.length > 0 ? (
          <CardItem translateZ="40" className="losers-card-list">
            {losers.map((stock) => (
              <div
                key={stock.symbol}
                className="losers-card-item"
              >
                <div className="stock-info">
                  <span className="symbol">{stock.symbol}</span>
                  <span className="name">{stock.name}</span>
                </div>
                <span className="change loss">{stock.change}%</span>
              </div>
            ))}
          </CardItem>
        ) : (
          <CardItem translateZ="60" className="losers-card-empty">
            No losers data available
          </CardItem>
        )}
      </CardBody>
    </CardContainer>
  );
}