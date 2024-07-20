export default {
  applications: [
    {
      code: 'SUBC',
      name: 'subcontractor',
      path: '/subcontractors',
      apptype: 'MXPLUS'
    },
    {
      code: 'CONC',
      name: 'contactcenter',
      path: '/contact-centre',
      apptype: 'MXPLUS'
    },
    {
      code: 'PELMXPDATA',
      name: 'mxplusdata',
      path: '/mxplusdata',
      apptype: 'MXPLUS'
    },
    {
      code: 'CUSTPORTAL',
      name: 'customerportal',
      path: '/customer-portal',
      apptype: 'MXPLUS'
    },
    {
      code: 'PELSUBAFP',
      name: 'subconafp',
      path: '/subcon-afp',
      apptype: 'MXPLUS'
    },
    {
      code: 'PELSUBAFPBULK',
      name: 'subconafpbulk',
      path: '/subcon-bulk',
      apptype: 'MXPLUS'
    },
    {
      code: 'PELWOPRICE',
      name: 'wopricing',
      path: '/wopricing',
      apptype: 'MXPLUS'
    },
    {
      code: 'PELDASH',
      name: 'dashboard',
      path: '/dashboard',
      apptype: 'MXPLUS'
    }
  ],
  search: {
    minSearchLength: 3,
    resultPageSize: 10,
    historySize: 50,
    pelsrlite: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT'
    },
    pelsrlitecp: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT'
    },
    pellocchild: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'OPERATING'
    },
    pelcustomer: {
      searchQueryTemplate: 'CUSTOMER_SEARCH',
      savedQuery: 'ACTIVECUSTOMER',
      useWildcard: true
    },
    pelendcustomer: {
      searchQueryTemplate: 'CUSTOMER_SEARCH',
      savedQuery: 'ACTIVECUSTOMER',
      useWildcard: true
    },
    pelperson: {
      searchQueryTemplate: 'PERSON_SEARCH',
      savedQuery: 'ACTIVEPERSON',
      useWildcard: true,
      fields: `
        displayname,personid,primaryemail,primaryphone,siteid,       
        pelmetadata.description,
        location.location,
        location.description,        
        pellocpclookup.builddesc,
        pellocpclookup.building,
        pluspcustcontact{
          customer,
          pluspcustomer{
            name,pelknownascust,peldefbusunit,pelpomand
          }
        }      
        `.replace(/\s/g, '')
    },
    pelpersongroup: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'SRONLY'
    },
    pelasset: {
      searchQueryTemplate: 'ASSET_SEARCH',
      savedQuery: 'INSCOPEASSETS'
    },
    pellocfull: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'OPERATING',
      fields: `location, parent,haschildren`
    },
    pelwo: {
      searchQueryTemplate: 'BASIC_SEARCH',
      fields: 'wonum'
    },
    PELDIAGNOSIS: {
      searchQueryTemplate: 'DIAGNOSIS_SEARCH',
      savedQuery: 'ISDIAGNOSIS'
    },
    pelsubafp: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT'
    },
    mitdoalist: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT'
    },
    mitcclist: {
      searchQueryTemplate: 'BASIC_SEARCH',
      savedQuery: 'DEFAULT'
    },
    pelsrfull: {
      fields: `
        ticketuid,ticketspec{*},ticketid,pelbusunit,internalpriority,origrecordid,origrecordclass,pluspagreement,actualfinish,reportdate,reportedby,affectedperson,assetnum,description,description_longdescription,pelsrtype, pelsrsubtype,customer,reportedbyname,reportedemail,reportedphone,location,site-building,pelclientref, pluspcustponum,affectedusername,affectedemail,affectedphone,pellocbuilding,mtfmworktype,status,status_description,classification,priority,targetstart,targetfinish,pelcarapprvalue,pelcarapprover,pelcarapprref,pelcarstatus,pelcarstdate,pelreportascrit,pelreportashs,siteid,ownergroup,owner,pelprioritychangedesc,mitcapersonid,mitcateam,mitcostcode,mitiscareq,mitisccreq,mitcastatus,mitcareason,mitcarearej,mitcadesc,mitccdesc,
        rel.pelorigsr{description},
        pluspcustomer{
          customer,name,pelpomand,pelknownascust
        },
        tkserviceaddress{pelsabusunit{*},description,addressline2,addressline3,city,postalcode},
        asset{
          assetnum,description
        },
        locations{
          location,description,pelapptent
        },
        classstructure{
          description_class,
          classstructureid
        },
        classstructureid,
        pellocpclookup{*},
        relatedrecord{
          workorder{
            workorderid,worklogs,wonum,description,worktype,status,status_description,estlabhrs,estlabcost,estmatcost,esttotalcost,plusppricesched,peladjestprice,pluspmaxprice,pelcustapprvalue,pelmandatestatus,plusptotalbilled,pluspbillstate,plusppricesched.inctotal,
            longdescription{*},
            assignment{
              assignmentid,craft,laborcode,status,scheduledate,laborhrs,peldescription,pelappointslotstart,pelappointslotfinish,pelownersystem,apptrequired,pelsendtoclick,
              rel.craft{
                description
              }
            },
            rel.wpservice{
              wpitemid,linetype,itemnum,description,description_longdescription,itemqty,
              rel.po{
                poid,status,status_description,ponum
              }
            },
            rel.wpmaterial{
              wpitemid,linetype,itemnum,description,description_longdescription,itemqty,
              rel.po{
                poid,status,status_description,ponum
              }
            },
            plusppricesched{
              description
            },
            rel.pluspcustpricest{
              worklogid,pluspestremark,createby,createdate,description,plusppriceest,pluspeststat,pluspestenddt,pluspeststatdt,pluspeststatusr
            },
            rel.pluspbillbatch{status,agreedprice,statusdate,billbatchnum},
            rel.pluspbillline{status,agreedprice}
          }
        }
      }`.replace(/\s/g, '')
    },
    pelassignmentsearch: {
      fields: `
        status,
        status_description,
        peldescription,
        peldescription_longdescription,
        assignmentid,
        workorder{
          href,
          locations{
            location,
            description
          },
          wonum,
          workorderid,
          worktype,
          status,
          status_description          
        }`.replace(/\s/g, ''),
      savedQuery: 'DEFAULT'
    },
    
    pelassignment: {
      fields: `
        status,
        status_description,
        peldescription,
        peldescription_longdescription,
        assignmentid,
        createddate,
        wpservice{
          totalcost,
          linecost,
          wpitemid,
          pelupliftcost,
          href,
          pelupliftdate,          
          pelupliftdesc,
          pelupliftstatus,
          pelupliftstatus_description
        },
        statusdate,
        startdate,
        finishdate,
        pelassignstart,
        pelassignfinish,
        pelmijobeta,
        pelpermitref,
        laborcode,
        labtrans{
          memo,
          startdate,
          starttime,
          finishtime,
          finishdate,
          labtransid,
          pelnumattendees,
          refwo,
          laborcode,
          pelassignmentid
        },
        workorder{
          statusdate,
          failurecode,
          pelapptent,
          pelpermitrequired,
          mtfmcof,
          doclinks{*},
          rel.pluscdoclinks{
            rel.pelcreateby{
              pluspcustvendor,
              pluspcustvndtype
            },
            doclinksid
          },
          href,
          reportedby,
          pelreportascrit,
          pelreportashs,
          locations{
            location,
            description
          },
          wonum,
          MTFMJPTYPE,
          workorderid,
          worktype,
          siteid,
          orgid,
          status,
          status_description,
          description,
          description_longdescription,
          rel.pluspcustomer{name},
          classstructure{
            description
          },
          failurereport{
            failurecode,
            type,
            failurereportid
          },
          multiassetlocci{
            sequence,
            multiid,
            assetnum,
            locations{
              description
            },
            pelworkcomp,
            pelnoncompreason,
            pelworkoutcome,
            pelcompdate,
            pelcompnotes,
            pelcompby,
            asset{
              assetnum,
              description,
              mtfmassetmodel,
              mtfmasstlocal,
              description,
              assettag,
              status,
              status_description,
              inscope,
              mtfmexpdate,
              serialnum,
              localref,
              assetmeter{
                assetmeterid,
                metername,
                metertype,
                description,
                measureunitid,
                lastreading,
                lastreadingdate,
                remarks,
                linearassetmeterid,
                localref,
                rel.meter{
                  description,
                  metertype
                }
              },
              assetspec{
                assetattrid,
                measureunitid,
                alnvalue,
                numvalue,
                tablevalue,
                rel.assetattribute{
                  description
                }
              }
            }
          },
          woserviceaddress{
            latitudey,
            longitudex,
            streetaddress,
            formattedaddress,
            postalcode,
            pelviaaddress,
            rel.pelviaaddress{formattedaddress},
            pelviatype,
            pelviadesc,
            serviceaddress {
              description
            }
          },
          wopriority,
          targstartdate,
          targcompdate,
          actstart,
          actfinish,
          schedstart,
          schedfinish,
          pellocbuilding,
          sr{
            reportdate,
            pelclientref,
            affectedperson,
            ticketid,
            status,
            status_description
          }
        },
        poline{
          linetype,
          orderqty,
          orderunit,
          ponum,
          po{
            ponum,
            poid,
            status,
            status_description,
            totalcost,
            potype,
            potype_description
          }
        },
        rel.wplabor{
          peldependflag,
          peldependonid,
          peldependdesc,
          peldependtype,
          peldependlag,
          rel.peldeplabor{
            wplaborid,
            rel.pelassignment{
              peldescription,
              status,
              status_description,
              assignmentid,
              pelassignstart,
              pelassignfinish,
              laborcode,
              rel.pelassignstatus{
                description
              },
              rel.uxlabor{
                displayname
              }
            }
          }
        }`.replace(/\s/g, ''),
      savedQuery: 'DEFAULT'
    }
  },
  maxOpenTabs: 20,
  storageType: 'local',
  storageKey: 'mxplus',
  session: {
    sessiontimeout: 1800,
    inactivetimeout: 120
  }
}
