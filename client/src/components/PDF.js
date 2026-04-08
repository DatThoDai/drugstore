import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Worker } from "@react-pdf-viewer/core";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listPdfDetails } from "../Redux/Actions/PdfActions";

const PDF = () => {
  const { id } = useParams();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const dispatch = useDispatch();
  const productEdit = useSelector((state) => state.pdfDetails);
  const { loading, error, product } = productEdit;

  useEffect(() => {
    dispatch(listPdfDetails(id));
  }, [dispatch]);

  return (
    <>
      <div className="pdf-container">
        {product.file && (
          <>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={product.file}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </>
        )}

        {!product.file && <>No pdf file selected</>}
      </div>
    </>
  );
};

export default PDF;
