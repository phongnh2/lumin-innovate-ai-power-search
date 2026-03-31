import EventConstants from 'Common/constants/EventConstants';

const EventIndex = {
  index: EventConstants.EVENT_INDEX,
  body: {
    mappings: {
      properties: {
        event_name: { type: 'keyword' },
        event_time: { type: 'date' },
        source_action: { type: 'keyword' },
        source_event_id: { type: 'keyword' },
        actor: {
          properties: {
            _id: { type: 'keyword' },
            name: { type: 'keyword' },
            email: { type: 'keyword' },
            avatar_remote_id: { type: 'keyword' },
            modification: {
              properties: {
                plan: { type: 'keyword' },
                cancel_plan_reason: { type: 'keyword' },
                plan_charge: {
                  type: 'scaled_float',
                  scaling_factor: 100,
                },
              },
            },
          },
        },
        target: {
          properties: {
            _id: { type: 'keyword' },
            name: { type: 'keyword' },
            email: { type: 'keyword' },
            avatar_remote_id: { type: 'keyword' },
            modification: {
              properties: {
                admin_role: { type: 'keyword' },
                plan: { type: 'keyword' },
                cancel_plan_reason: { type: 'keyword' },
              },
            },
            transactional_email: {
              properties: {
                subject: { type: 'text' },
              },
            },
          },
        },
        organization: {
          properties: {
            _id: { type: 'keyword' },
            name: { type: 'keyword' },
            domain: { type: 'keyword' },
            plan_modification: {
              properties: {
                previous_plan: { type: 'keyword' },
                previous_charge: {
                  type: 'scaled_float',
                  scaling_factor: 100,
                },
                plan: { type: 'keyword' },
                plan_charge: {
                  type: 'scaled_float',
                  scaling_factor: 100,
                },
                cancel_plan_reason: { type: 'keyword' },
              },
            },
          },
        },
        team: {
          properties: {
            _id: { type: 'keyword' },
            name: { type: 'keyword' },
            belongs_to: { type: 'keyword' },
            modification: {
              properties: {
                member_role: { type: 'keyword' },
                plan: { type: 'keyword' },
                plan_charge: {
                  type: 'scaled_float',
                  scaling_factor: 100,
                },
              },
            },
          },
        },
        document: {
          properties: {
            _id: { type: 'keyword' },
            name: { type: 'keyword' },
            s3_remote_id: { type: 'keyword' },
            comment: {
              properties: {
                _id: { type: 'keyword' },
                content: { type: 'text' },
              },
            },
            annotation: {
              properties: {
                _id: {
                  type: 'keyword',
                  eager_global_ordinals: true,
                },
                type: { type: 'keyword' },
              },
            },
          },
        },
        template: {
          properties: {
            lumin_documentform_id: { type: 'keyword' },
            prismic_id: { type: 'keyword' },
            url: { type: 'keyword' },
            prismic_categories: { type: 'keyword' },
            s3_remote_id: { type: 'keyword' },
          },
        },
        actor_event_scope: { type: 'keyword' },
        target_event_scope: { type: 'keyword' },
      },
    },
  },
};

export default { EventIndex };
