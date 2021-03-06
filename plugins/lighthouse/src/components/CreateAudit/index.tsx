/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState, useCallback, FC } from 'react';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Grid,
  Button,
  List,
  ListItem,
  MenuItem,
  TextField,
} from '@material-ui/core';
import {
  errorApiRef,
  useApi,
  InfoCard,
  Header,
  Page,
  pageTheme,
  Content,
  ContentHeader,
  HeaderLabel,
} from '@backstage/core';

import { lighthouseApiRef } from '../../api';
import { useQuery } from '../../utils';
import LighthouseSupportButton from '../SupportButton';

const useStyles = makeStyles(theme => ({
  input: {
    minWidth: 300,
  },
  buttonList: {
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const CreateAudit: FC<{}> = () => {
  const errorApi = useApi(errorApiRef);
  const lighthouseApi = useApi(lighthouseApiRef);
  const classes = useStyles();
  const query = useQuery();
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState<string>(query.get('url') || '');
  const [emulatedFormFactor, setEmulatedFormFactor] = useState('mobile');

  const triggerAudit = useCallback(async (): Promise<void> => {
    setSubmitting(true);
    try {
      // TODO use the id from the response to redirect to the audit page for that id when
      // FAILED and RUNNING audits are supported
      await lighthouseApi.triggerAudit({
        url,
        options: {
          lighthouseConfig: {
            settings: {
              emulatedFormFactor,
            },
          },
        },
      });
      history.push('/lighthouse');
    } catch (err) {
      errorApi.post(err);
    } finally {
      setSubmitting(false);
    }
  }, [url, emulatedFormFactor, lighthouseApi, setSubmitting, errorApi, history]);

  return (
    <Page theme={pageTheme.tool}>
      <Header
        title="Lighthouse"
        subtitle="Website audits powered by Lighthouse"
      >
        <HeaderLabel label="Owner" value="Spotify" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader
          title="Trigger a new audit"
          description="Submitting this form will immediately trigger and store a new Lighthouse audit. Trigger audits to track your website's accessibility, performance, SEO, and best practices over time."
        >
          <LighthouseSupportButton />
        </ContentHeader>
        <Grid container direction="column">
          <Grid item xs={12} sm={6}>
            <InfoCard>
              <form
                onSubmit={ev => {
                  ev.preventDefault();
                  triggerAudit();
                }}
              >
                <List>
                  <ListItem>
                    <TextField
                      name="lighthouse-create-audit-url-tf"
                      className={classes.input}
                      label="URL"
                      placeholder="https://spotify.com"
                      helperText="The target URL for Lighthouse to use."
                      required
                      disabled={submitting}
                      onChange={ev => setUrl(ev.target.value)}
                      value={url}
                      inputProps={{ 'aria-label': 'URL' }}
                    />
                  </ListItem>
                  <ListItem>
                    <TextField
                      name="lighthouse-create-audit-emulated-form-factor-tf"
                      className={classes.input}
                      label="Emulated Form Factor"
                      helperText="Device to simulate when auditing"
                      select
                      required
                      disabled={submitting}
                      onChange={ev => setEmulatedFormFactor(ev.target.value)}
                      value={emulatedFormFactor}
                      inputProps={{ 'aria-label': 'Emulated form factor' }}
                    >
                      <MenuItem value="mobile">Mobile</MenuItem>
                      <MenuItem value="desktop">Desktop</MenuItem>
                    </TextField>
                  </ListItem>
                  <ListItem className={classes.buttonList}>
                    <Button
                      variant="outlined"
                      color="primary"
                      href="/lighthouse"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={submitting}
                    >
                      Create Audit
                    </Button>
                  </ListItem>
                </List>
              </form>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default CreateAudit;
