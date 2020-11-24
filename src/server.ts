import app from './app';

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333!');
});

/**
 * Migrations
 * yarn typeorm migration:create -n CreateAppointments
 * yarn typeorm migration:run
 * yarn typeorm migration:revert
 * yarn typeorm migration:show
 */
