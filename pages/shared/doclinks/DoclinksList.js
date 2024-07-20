import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import FileViewer from 'react-file-viewer'
import Moment from 'react-moment'
import Iframe from 'react-iframe'
import Download32 from '@carbon/icons-react/lib/download/32'
import Warning32 from '@carbon/icons-react/lib/warning/32'
import { CreateDoclink } from '../../modules/contact-center/components/CreateDoclink'

export const DoclinksList = ({ data, hideCreateButton, section, pelreqdocs }) => {
  const receivedDoclinkData = section ? data?.workorder?.doclinks : data?.member[0]?.doclinks

  const doclinkData =
    receivedDoclinkData?.member
      ?.filter(doc => doc.describedBy?.docinfoid)
      .map(dc => ({
        id: parseInt(dc?.describedBy?.identifier, 10),
        ...dc
      })) ?? []

  if (!pelreqdocs && doclinkData) {
    doclinkData.href = data?.member[0]?.doclinks?.href
  }

  const filterArray = (data, fields, value) => {
    const array = data.filter(item => {
      const found = fields.every((field, index) => {
        return item[field] && item[field] === value[index]
      })
      return found
    })
    return array
  }

  const supportFileTypes = [
    'csv',
    'xlsx',
    'jpg',
    'jpeg',
    'gif',
    'bmp',
    'png',
    'pdf',
    'docx',
    'mp3',
    'webm',
    'mp4',
    'wexbim'
  ]
  const [updatedList, setUpdatedList] = useState([])

  const [state, setState] = useState({
    docs: pelreqdocs
      ? doclinkData?.filter(doclink => updatedList.includes(doclink.id))
      : doclinkData,
    href: undefined,
    name: undefined,
    doctype: undefined,
    supported: undefined,
    doclink: undefined
  })

  useEffect(() => {
    setUpdatedList([])
    if (pelreqdocs) {
      doclinkData.forEach(doclink => {
        updatedList.push(doclink.id)
      })
      pelreqdocs.forEach(reqDoc => {
        if (
          reqDoc.objectname === 'ASSIGNMENT' &&
          data?.assignmentid !== reqDoc?.assignmentid &&
          updatedList?.includes(reqDoc?.doclinksid)
        ) {
          const index = updatedList?.indexOf(reqDoc?.doclinksid)
          if (index > -1) {
            updatedList.splice(index, 1)
          }
        }
      })

      setState(currentState => ({
        ...currentState,
        docs: doclinkData?.filter(doclink => updatedList.includes(doclink.id))
      }))
    } else {
      setState(currentState => ({ ...currentState, docs: doclinkData }))
    }
  }, [receivedDoclinkData, pelreqdocs])

  
  const onError = err => {}

  const handleClick = doclink => () => {
    const [, extension] = doclink?.describedBy?.fileName?.split('.') ?? ['', '']
    setState({
      ...state,
      doclink,
      doctype: extension.toLowerCase(),
      href: doclink.href,
      supported: supportFileTypes.includes(extension.toLowerCase())
    })
  }

  const handleUpdate = updatedDocs => {
    if (updatedDocs) {
      const updatedDoclinks = updatedDocs?.doclinks?.member?.map(dc => ({
        id: parseInt(dc?.describedBy?.identifier, 10),
        ...dc
      }))
      updatedDoclinks.href = updatedDocs?.doclinks?.href

      setState({
        ...state,
        docs: updatedDoclinks
      })
    }
  }

  return (
    <>
      {state?.docs?.length > 0 && (
        <div className="pel--container bx--grid pel--doclinks pel-flex-column pel--bottom-space">
          <div className="bx--row">
            <div className="bx--col-sm-1 pel--scroll">
              {state?.docs?.map((doclink, index) => {
                return (
                  <div
                    key={`doc-${doclink.describedBy.docinfoid}`}
                    onClick={handleClick(doclink)}
                    className="pel--list-item bx--tile bx--tile--clickable pel-doclinks-card"
                    role="button"
                    tabIndex={index}
                    onKeyUp={() => {}}
                  >
                    <div className="bx--row">
                      <div className="bx--col-sm-12 pel--doc-container-padding">
                        <h5 className="bx--tile-text__small">{doclink.describedBy.title}</h5>
                        <p className="bx--tile-text__small">{doclink.describedBy.docType}</p>
                        <p className="bx--tile-text">
                          <Moment format="DD-MMM-YYYY">{doclink.describedBy.created}</Moment>
                        </p>
                        <div className="pel--download-container">
                          <p className="bx--tile-text__small">{doclink.describedBy.createby}</p>
                          <a
                            className="pel--button bx--btn bx--btn--tertiary bx--btn--icon-only pel--download-icon-sub"
                            href={doclink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doclink.describedBy.title}
                          >
                            <Download32 aria-label="Download" />
                          </a>
                        </div>
                        <span className="bx--tile-text__small">
                          Note:
                          <div className="notes-description">{doclink.describedBy.description}</div>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="bx--col-sm-3 pel--docviewer">
              {state.supported &&
                (state.doctype === 'pdf' ? (
                  <Iframe url={state.href} width="100%" height="100%" />
                ) : (
                  <FileViewer
                    fileType={state.doctype}
                    filePath={state.href}
                    onError={onError}
                    key={state.href}
                  />
                ))}
              {!state.supported && state.href && (
                <div className="pel--noresults">
                  <Warning32 />
                  <div>File type not supported</div>
                  <a href={state.href} download>
                    Download file to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {state?.docs?.length === 0 && (
        <div className="pel--doc-container">
          <p>This work order does not currently have any linked documents.</p>
        </div>
      )}

      {!hideCreateButton && (
        <div className="bx--row pel--footer-bar">
          <CreateDoclink doclinksData={doclinkData} onUpdate={handleUpdate} />
        </div>
      )}
    </>
  )
}

DoclinksList.propTypes = {
  data: PropTypes.any,
  pelreqdocs: PropTypes.arrayOf(PropTypes.object),
  hideCreateButton: PropTypes.bool,
  section: PropTypes.string
}
