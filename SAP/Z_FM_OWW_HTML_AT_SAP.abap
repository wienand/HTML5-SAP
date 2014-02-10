FUNCTION z_fm_oww_html_at_sap.
*"----------------------------------------------------------------------
*"*"Lokale Schnittstelle:
*"  TABLES
*"      QUERY_STRING STRUCTURE  W3QUERY
*"      HTML STRUCTURE  W3HTML
*"      MIME STRUCTURE  W3MIME
*"  CHANGING
*"     REFERENCE(CONTENT_TYPE) LIKE  W3PARAM-CONT_TYPE DEFAULT
*"       'APPLICATION/JSON'
*"     REFERENCE(CONTENT_LENGTH) LIKE  W3PARAM-CONT_LEN
*"     REFERENCE(RETURN_CODE) LIKE  W3PARAM-RET_CODE
*"----------------------------------------------------------------------

*"---------------------------------------------------
*" ATTENTION: No checks regarding user input are done
*"---------------------------------------------------

  DATA: htmldoc LIKE LINE OF html.

  DATA: material TYPE string,
        quantity TYPE string,
        unit TYPE string.

* Query string contains get paraemets
  SORT query_string DESCENDING.

  READ TABLE query_string WITH KEY name = 'material'.
  material = query_string-value.

  READ TABLE query_string WITH KEY name = 'quantity'.
  quantity = query_string-value.

  READ TABLE query_string WITH KEY name = 'unit'.
  unit = query_string-value.

* If material is * return a list of materials
  IF material EQ '*'.
    DATA:
      it_makt TYPE TABLE OF MAKT,
      it_makt_wa LIKE LINE OF it_makt.

    SELECT * FROM makt INTO CORRESPONDING FIELDS OF TABLE it_makt WHERE SPRAS = 'D'.

    CLEAR htmldoc.
    htmldoc-line = '{'.
    INSERT htmldoc INTO TABLE html.
    LOOP AT it_makt INTO it_makt_wa.
      CLEAR htmldoc.
      CONCATENATE '"' it_makt_wa-matnr '":{"description":"' it_makt_wa-maktx '"},'INTO htmldoc-line.
      INSERT htmldoc INTO TABLE html.
    ENDLOOP.
    CLEAR htmldoc.
    htmldoc-line = '"DUMMY": {"description": "DUMMY"}}'.
    INSERT htmldoc INTO TABLE html.

* Otherwise create a goods receipt document
  ELSE.

    DATA: gt_goodsmvt_header  LIKE bapi2017_gm_head_01,
          gt_goodsmvt_item    LIKE bapi2017_gm_item_create OCCURS 0 WITH HEADER LINE,
          gt_return           LIKE bapiret2 OCCURS 0 WITH HEADER LINE.

    gt_goodsmvt_header-pstng_date = '20130330'.  " sy-datum.
    gt_goodsmvt_header-doc_date   = '20130330'.  " sy-datum.

    CLEAR gt_goodsmvt_item.
    gt_goodsmvt_item-material             = material.
    gt_goodsmvt_item-plant                = '1000'.
    gt_goodsmvt_item-stge_loc             = '1000'.
    gt_goodsmvt_item-move_type            = '561'.
    gt_goodsmvt_item-entry_qnt            = quantity.
    gt_goodsmvt_item-entry_uom            = unit.
    gt_goodsmvt_item-no_more_gr           = 'X'.
    APPEND gt_goodsmvt_item TO gt_goodsmvt_item.

    CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
      EXPORTING
        goodsmvt_header = gt_goodsmvt_header
        goodsmvt_code   = '05'
      TABLES
        goodsmvt_item   = gt_goodsmvt_item
        return          = gt_return.

    CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.

    CLEAR htmldoc.
    CONCATENATE '{"results": [ {"material": "' material '", "amount": ' quantity ' , "unit": "' unit '"}]}' INTO htmldoc-line.
    INSERT htmldoc INTO TABLE html.
  ENDIF.

ENDFUNCTION.